import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";

const EditorFormComponent = () => {
  const handleUploadBanner = (event) => {
    // ambil nama file yang di upload
    let img = event.target.files[0];
    console.log(img);
  };

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

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img src={defaultBanner} className="z-20" alt="" />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png .jpg .jpeg"
                  hidden
                  onChange={handleUploadBanner}
                />
              </label>
            </div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default EditorFormComponent;
