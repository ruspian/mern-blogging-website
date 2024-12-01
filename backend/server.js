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
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

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

const storageProfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/profil/");
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

const uploadProfil = multer({
  storage: storageProfil,
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

app.post(
  "/profil-image-url",
  uploadProfil.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Tidak ada gambar yang diunggah" });
      }

      const filePath = `/uploads/profil/${req.file.filename}`;
      res.json({
        success: true,
        filePath,
        fileName: req.file.filename,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

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

app.post("/ubah-password", verifyJWT, (req, res) => {
  let { passwordSaatIni, passwordBaru } = req.body;

  // validasi jika password tidak sesuai regex
  if (
    !passwordRegex.test(passwordSaatIni) ||
    !passwordRegex.test(passwordBaru)
  ) {
    return res.status(403).json({
      error:
        "Password Harus Minimal 6 - 20 Karakter! Dengan Huruf Besar, Huruf Kecil, dan Angka!",
    });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      // validasi password yang login dengan google
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "Maaf pengguna yang login dengan Google tidak bisa mengubah password!",
        });
      }

      // menyocokkan password dengan hasil hash untuk login
      bcrypt.compare(
        passwordSaatIni,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res.status(403).json({
              error: "terjadi Kesalahan Saat Mengubah Password, Coba Lagi!",
            });
          }

          if (!result) {
            return res
              .status(403)
              .json({ error: "Password yang anda masukkan salah!" });
          }

          // membuat password baru
          bcrypt.hash(passwordBaru, 10, (err, hashed_password) => {
            // update password database
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password }
            )
              .then((u) => {
                return res.status(200).json({
                  message: "Password Berhasil Diubah!",
                });
              })
              .catch((err) => {
                return res.status(500).json({
                  error: "Terjadi kesalahan saat mengubah password, Coba lagi",
                });
              });
          });
        }
      );
    })
    .catch((err) => {
      return res.status(500).json({ error: "User tidak ditemukan" });
    });
});

app.post("/blog-terbaru", (req, res) => {
  let { page } = req.body;

  let maxLimit = 5;

  // ambil data blog dari database
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/semua-blog-terbaru", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.massage });
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
  let { tag, query, author, page, limit, eliminate_blog } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  let maxLimit = limit ? limit : 2;

  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/blog-kategori", (req, res) => {
  let { tag, query, author } = req.body;

  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.massage });
    });
});

app.post("/cari-pengguna", (req, res) => {
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select(
      "personal_info.username personal_info.fullname  personal_info.profile_img -_id"
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/profil", (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updateAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/change-image-profil", verifyJWT, async (req, res) => {
  let { url } = req.body;

  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: "URL gambar tidak boleh kosong" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user },
      { "personal_info.profile_img": url }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    res.status(200).json({ success: true, profile_img: url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/update-profil", verifyJWT, (req, res) => {
  // console.log("Data yang diterima:", req.body);

  let bioLimit = 150;
  let { username, bio, social_links } = req.body;

  if (username < 3) {
    return res.status(403).json({ error: "Username minimal 3 karakter" });
  }

  if (bio.length > bioLimit) {
    return res.status(403).json({ error: "Bio maximal 150 karakter" });
  }

  let socialLinksArray = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinksArray.length; i++) {
      if (social_links[socialLinksArray[i]].length) {
        let hostname = new URL(social_links[socialLinksArray[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArray[i]}.com`) &&
          socialLinksArray[i] !== "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArray[i]} tidak valid, contoh: http(s)://${socialLinksArray[i]}.com`,
          });
        }
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "URL tidak valid, gunakan http(s)://" });
  }

  // Objek update
  let updateObject = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };

  User.findOneAndUpdate({ _id: req.user }, updateObject, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      // console.error("Error saat update profil:", err);
      if (err.code == 11000) {
        return res.status(409).json({ error: "Username sudah digunakan" });
      }

      return res.status(500).json({ error: err.message });
    });
});

app.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;

  // ambil data dari frontend
  let { title, content, tags, des, banner, draft, id } = req.body;

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
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      { title, des, banner, content, tags, draft: draft ? draft : false }
    )
      .then(() => {
        return res.status(200).json({ id: blog_id });
      })
      .catch((err) => {
        return res.status(500).json({ error: "Update konten blog gagal!" });
      });
  } else {
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
            return res
              .status(500)
              .json({ error: "gagal mengupdate total post" });
          });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  }
});

app.post("/blog", (req, res) => {
  let { blog_id, draft, mode } = req.body;

  let incrementVal = mode !== "edit" ? 1 : 0;

  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        {
          $inc: { "account_info.reads": incrementVal },
        }
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });

      if (blog.draft && !draft) {
        return res
          .status(500)
          .json({ error: "Anda tidak dapat mengakses draf blog!" });
      }

      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id, isLike } = req.body;

  let incrementVal = !isLike ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  ).then((blog) => {
    if (!isLike) {
      let like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      like.save().then((notification) => {
        return res.status(200).json({ liked_by_user: true });
      });
    } else {
      Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      })
        .then((data) => {
          return res.status(200).json({ liked_by_user: false });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  });
});

app.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/komentar", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id, comment, blog_author, replying_to, notification_id } = req.body;

  if (!comment.length) {
    return res.status(500).json({ error: "Tuliskan Komentar anda!" });
  }

  // buat komen doc
  let commentObject = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentObject.parent = replying_to;
    commentObject.isReply = true;
  }

  new Comment(commentObject).save().then(async (commentFile) => {
    let { comment, commentedAt, children } = commentFile;

    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    ).then((blog) => {
      console.log("komentar baru dibuat");
    });

    let notificationObject = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObject.replied_on_comment = replying_to;

      await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      ).then((replyingToCommentDoc) => {
        notificationObject.notification_for = replyingToCommentDoc.commented_by;
      });

      if (notification_id) {
        Notification.findOneAndUpdate(
          { _id: notification_id },
          { reply: commentFile._id }
        ).then((notification) => console.log("Notifikasi diupdate!"));
      }
    }

    new Notification(notificationObject)
      .save()
      .then((notification) => console.log("notification created"));

    return res
      .status(200)
      .json({ comment, commentedAt, _id: commentFile._id, user_id, children });
  });
});

app.post("/blog-komentar", (req, res) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;

  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({ commentedAt: -1 })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/balas-komentar", (req, res) => {
  let { _id, skip } = req.body;

  let maxLimit = 5;

  Comment.findOne({ _id })
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.username personal_info.fullname personal_info.profile_img",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

const hapusKomentar = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } }
        )
          .then((data) => console.log("komentar berhasil dihapus!"))
          .catch((err) => console.log(err));
      }

      Notification.findOneAndDelete({ comment: _id }).then((notification) =>
        console.log("notifikasi berhasil dihapus!")
      );

      Notification.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } }
      ).then((notification) => console.log("Balasan berhasil dihapus!"));

      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: {
            "activity.total_comments": -1,
          },
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        }
      ).then((blog) => {
        if (comment.children.length) {
          comment.children.map((replies) => {
            hapusKomentar(replies);
          });
        }
      });
    })
    .catch((err) => console.log(err.message));
};

app.post("/hapus-komentar", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  Comment.findOne({ _id }).then((comment) => {
    // console.log("user_id:", user_id);
    // console.log("comment.commented_by:", comment.commented_by);
    // console.log("comment.blog_author:", comment.blog_author);

    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      hapusKomentar(_id);
      return res.status(200).json({ status: "Komentar berhasil dihapus!" });
    } else {
      return res.status(403).json({ error: "Hapus komentar gagal!" });
    }
  });
});

app.get("/notifikasi-baru", verifyJWT, (req, res) => {
  let user_id = req.user;

  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      if (result) {
        return res.status(200).json({ notifikasi_baru: true });
      } else {
        return res.status(200).json({ notifikasi_baru: false });
      }
    })
    .catch((err) => {
      console.log(err.message);

      return res.status(500).json({ error: err.message });
    });
});

app.post("/notifikasi", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, filter, deletedDocCount } = req.body;
  let maxLimit = 10;

  let findQuery = {
    notification_for: user_id,
    user: { $ne: user_id },
  };

  let skipDocs = (page - 1) * maxLimit;

  if (filter !== "all") {
    findQuery.type = filter;
  }

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate(
      "user",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then((notifications) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => console.log("Notifikasi dilihat!"));

      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/semua-notifikasi", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { filter } = req.body;
  let findQuery = {
    notification_for: user_id,
    user: { $ne: user_id },
  };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/user-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, draft, query, deletedDocCount } = req.body;
  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id activity des draft -_id")
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      // console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/user-blog-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { draft, query } = req.body;

  Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, "i") })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/hapus-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { blog_id } = req.body;

  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) =>
        console.log("Notifikasi dihapus!")
      );

      Comment.deleteMany({ blog_id: blog._id }).then((data) =>
        console.log("Komentar dihapus!")
      );

      User.findOneAndUpdate(
        {
          _id: user_id,
        },
        { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } }
      ).then((user) => console.log("Blog dihapus!"));

      return res.status(200).json({ status: "Blog dihapus!" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

// jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
