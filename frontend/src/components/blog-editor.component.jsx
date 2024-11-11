import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";

const EditorFormComponent = () => {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="" />
        </Link>

        <p className="max-md:hidden trxt-black line-clamp-1 w-full">
          Blog Baru
        </p>

        <div className="flex gap-4 ml-auto ">
          <button className="btn-dark py-2">Terbitkan</button>
          <button className="btn-light py-2">Simpan Draft</button>
        </div>
      </nav>
    </>
  );
};

export default EditorFormComponent;
