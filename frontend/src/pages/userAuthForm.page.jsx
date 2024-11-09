import { Link } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";

const UserAuthForm = ({ type }) => {
  return (
    <section className="h-cover flex items-center justify-center">
      <form action="" className="w-[80%] max-w-[400px]">
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
        <button className="btn-dark center mt-14" type="submit">
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
  );
};

export default UserAuthForm;
