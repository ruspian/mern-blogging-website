import pageNotFoundImage from "../imgs/404.png";
import fullLogo from "../imgs/full-logo.png";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={pageNotFoundImage}
        className="select-none w-[400px] h-[200px] aspect-square object-cover rounded"
      />

      <h1 className="text-3xl font-gelasio leading-7 ">
        Halaman Tidak Ditemukan!
      </h1>
      <p className="text-dark-grey font-gelasio text-xl leading-7 -mt-8">
        Halaman yang Anda cari tidak ada. kembali ke{" "}
        <Link to="/" className="text-black underline ">
          halaman utama
        </Link>
      </p>

      <div className="mt-auto ">
        <img
          src={fullLogo}
          className="h-12 object-contain block mx-auto select-none"
        />
        <p className="mt-5 text-sm text-dark-grey">
          Created By: <br />
          Ruspian Majid &copy; 2024
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
