import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import serviceAccountKey from "./config/firebaseConfig.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

// import schema
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";

const app = express();
let PORT = 3000;

// firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex untuk email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex untuk password

// Definisikan __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // URL React app
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// koneksi ke database mongoodb
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/blogpost/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter file yang diunggah
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file bertipe JPEG, PNG, atau JPG yang diperbolehkan"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
});

// middleware JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res
      .status(401)
      .json({ error: "Maaf anda tidak memiliki akses token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Acces token tidak valid" });
    }
    req.user = user.id;
    next();
  });
};

// format data yang dikirimkan
const formatDataToSend = (user) => {
  // buat token
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

// fungsi untuk generate username
const generateUsername = async (email) => {
  let username = email.split("@")[0]; // Ambil username dari email sampai tanda @ saja
  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => {
    return result;
  });
  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";
  return username;
};

// Route untuk unggah gambar (untuk postingan blog)
app.post("/image-url", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Tidak ada gambar yang diunggah" });
  }

  res.json({
    success: true,
    filePath: `/uploads/blogpost/${req.file.filename}`,
    fileName: req.file.filename,
  });
});

// route
app.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;

  // Validasi data dari frontend
  if (fullname.length < 3) {
    return res.status(403).json({
      error: "Nama lengkap harus minimal 3 karakter",
    });
  }

  // Validasi email
  if (!email.length) {
    return res.status(403).json({
      error: "Email Tidak Boleh Kosong!",
    });
  }

  // Validasi email berdasarkan regex
  if (!emailRegex.test(email)) {
    return res.status(403).json({
      error: "Email Tidak Valid!",
    });
  }

  // Validasi password berdasarkan regex
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password Harus Minimal 6 - 20 Karakter! Dengan Huruf Besar, Huruf Kecil, dan Angka!",
    });
  }

  // Hash password
  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: "Error hashing password" });
    }

    let username = await generateUsername(email);
    let user = new User({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    // Simpan user ke database
    user
      .save()
      .then((usr) => {
        return res.status(200).json(formatDataToSend(usr));
      })
      .catch((err) => {
        // Tangani error duplikasi email (code 11000)
        if (err.code === 11000) {
          return res.status(400).json({
            error: `Email ${err.keyValue["personal_info.email"]} sudah terdaftar. Silakan gunakan email lain.`,
          });
        }

        // Tangani error lainnya
        return res.status(500).json({
          error: "Terjadi kesalahan saat menyimpan data pengguna.",
        });
      });
  });
});

app.post("/signin", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
    .then((user) => {
      //validasi user
      if (!user) {
        return res.status(403).json({ error: "Email Tidak Ditemukan!" });
      }

      if (!user.google_auth) {
        // menyocokkan password dengan hasil hash untuk login
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res
              .status(403)
              .json({ error: "Kesalahan Saat Login, Coba Lagi!" });
          }

          //   validasi password
          if (!result) {
            return res.status(403).json({ error: "Password Salah!" });
          } else {
            return res.status(200).json(formatDataToSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error:
            "Akun Sudah dibuat menggunakan Google. Silahkan masuk Dengan Google!",
        });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(403).json({ error: err.message });
    });
});

app.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;

      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal.info.username personal.info.profile_img google_auth"
        )
        .then((usr) => {
          return usr || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        // login
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "Email Ini Sudah Didaftarkan Tanpa Google. Silakan Masuk Dengan Kata Sandi Untuk Mengakses Akun",
          });
        }
      } else {
        // signup
        let username = await generateUsername(email);

        user = new User({
          personal_info: {
            fullname: name,
            email,
            username,
          },
          google_auth: true,
        });

        await user
          .save()
          .then((usr) => {
            user = usr;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }

      return res.status(200).json(formatDataToSend(user));
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Gagal mengautentikasi Anda dengan Google. Coba dengan akun Google lainnya",
      });
    });
});

app.get("/blog-terbaru", (req, res) => {
  let maxLimit = 5;

  // ambil data blog dari database
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.get("/blog-terpopuler", (req, res) => {
  // ambil data blog dari database
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_reads": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/cari-blog", (req, res) => {
  let { tag } = req.body;

  let findQuery = { tags: tag, draft: false };

  let maxLimit = 5;

  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;

  // ambil data dari frontend
  let { title, content, tags, des, banner, draft } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "Maaf judul belum diisi!" });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({ error: "Maaf deskripsi belum diisi!" });
    }

    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "Maaf gambar banner belum diunggah!" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "Tuliskan Sesuatu yang menarik dalam blog anda!" });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({ error: "Tambahkan minimal satu tagar!" });
    }
  }

  // mengubah tag menjadi huruf kecil
  tags = tags.map((tag) => {
    return tag.toLowerCase();
  });

  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  let blog = new Blog({
    title,
    des,
    banner,
    content,
    tags,
    author: authorId,
    draft: Boolean(draft),
    blog_id,
  });

  blog
    .save()
    .then((blog) => {
      // untuk menghitung jumlah blog yang ada
      let incrementVal = draft ? 0 : 1;

      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog_id });
        })
        .catch((err) => {
          return res.status(500).json({ error: "gagal mengupdate total post" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

// jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
