import { Link, Navigate } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
// import { useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { useContext } from "react";
import { UserContext } from "../App";

const UserAuthForm = ({ type }) => {
  // hook
  // const authForm = useRef();

  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  // fungsi auth pengguna melalui server
  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  // fungsi untuk handle submit
  const handleSubmit = (event) => {
    // mencegah aksi default bawaan browser
    event.preventDefault();

    const serverRoute = type === "sign-in" ? "/signin" : "/signup";

    // regex
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex untuk email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex untuk password

    // ambil data dari form
    let form = new FormData(authForm);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;
    // form validasi untuk signup
    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Nama lengkap harus minimal 3 karakter");
      }
    }

    // Validasi email
    if (!email.length) {
      return toast.error("Email Tidak Boleh Kosong!");
    }

    // Validasi email berdasarkan regex
    if (!emailRegex.test(email)) {
      return toast.error("Email Tidak Valid!");
    }

    // Validasi password berdasarkan regex
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password Harus Minimal 6 - 20 Karakter! Dengan Huruf Besar, Huruf Kecil, dan Angka!"
      );
    }

    // memanggil auth pengguna melalui server
    userAuthThroughServer(serverRoute, formData);
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form action="" className="w-[80%] max-w-[400px]" id="authForm">
          <h1 className="text-3xl font-gelasio capitalize text-center mb-24">
            {type == "sign-in" ? "Selemat Datang Kembali!" : "Gabung Sekarang!"}
          </h1>

          {/* input nama lengkap */}
          {type !== "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Nama Lengkap"
              icon="fi-br-user"
            />
          ) : (
            ""
          )}

          {/* input email */}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-br-envelope"
          />

          {/* input password */}

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-br-lock"
          />

          {/* tombol daftar */}
          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type == "sign-in" ? "Masuk" : "Daftar"}
          </button>

          <div
            className="relative w-full flex items-center gap-2 my-10 opacity-20 uppercase text-black font-bold"
            type="submit"
          >
            <hr className="w-1/2 border-b border-black" />
            <p>atau</p>
            <hr className="w-1/2 border-b border-black" />
          </div>

          {/* tombol google */}
          <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
            <img src={googleIcon} className="w-5" alt="" />
            Masuk dengan Google
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Belum Punya Akun?{" "}
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Daftar Disini!
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Sudah Mempunyai Akun?{" "}
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Masuk
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
