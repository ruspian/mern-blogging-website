import expresss, { json } from "express";
import mongoose from "mongoose";
import bcrypt, { compare } from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import serviceAccountKey from "./config/firebaseConfig.js";
import "dotenv/config";

// import schema
import User from "./Schema/User.js";

const app = expresss();
let PORT = 3000;

// firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex untuk email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex untuk password

// middleware
app.use(expresss.json());
app.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

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

// jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
