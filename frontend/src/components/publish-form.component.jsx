import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const PublishFormComponent = () => {
  const caracterLimit = 200;
  const tagLimit = 10;

  let {
    blog,
    blog: { banner, title, tags, des, content },
    setEditorState,
    setBlog,
  } = useContext(EditorContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let navigate = useNavigate();

  // fungsi untuk menutup halaman
  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  // fungsi ketika judul blog diubah
  const handleBlogTitleChange = (event) => {
    let input = event.target;

    setBlog({ ...blog, title: input.value });
  };

  // fungsi ketika deskripsi blog diubah
  const handleBlogDescriptionChange = (event) => {
    let input = event.target;

    setBlog({ ...blog, des: input.value });
  };

  // fungsi mematikan tombol enter
  const handleTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  // fungsi untuk menampilkan tag
  const handleTagKeyDown = (event) => {
    if (event.keyCode === 13 || event.keyCode === 188) {
      event.preventDefault();

      let tag = event.target.value;

      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error("Anda hanya bisa menambahkan 10 tag saja");
      }

      event.target.value = "";
    }
  };

  // fungsi untuk mempublikasikan blog
  const publishBlog = (event) => {
    if (event.target.className.includes("disabled")) {
      return;
    }

    if (!title.length) {
      return toast.error("Tambahkan judul sebelum mempublikasikan blog");
    }

    if (!des.length || des.length > caracterLimit) {
      return toast.error("Tambahkan deskripsi sebelum mempublikasikan blog");
    }

    if (!tags.length) {
      return toast.error("Tambahkan Minimal 1 Tag!");
    }

    let loadingToast = toast.loading("Sedang Mempublish blog anda...");

    event.target.classList.add("disabled");

    let blogObject = {
      title,
      des,
      tags,
      content,
      banner,
      draft: false,
    };

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObject, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        event.target.classList.remove("disabled");
        toast.dismiss(loadingToast);
        toast.success("Blog anda berhasil dipublikasikan!");

        setTimeout(() => {
          navigate("/");
        }, 500);
      })
      .catch(({ response }) => {
        event.target.classList.remove("disabled");
        toast.dismiss(loadingToast);
        toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />

        {/* tombol untuk menutup halaman */}
        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        {/* konten */}
        <div className="max-w-[500px] center ">
          {/* pratinjau gambar */}
          <p className="text-dark-grey mb-1">Pratinjau</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} alt="" />
          </div>

          {/* pratinjau judul */}
          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          {/* pratinjau deskripsi */}
          <p className="font-gelasio line-clamp-2text-xl leading-7 mt-4">
            {des}
          </p>
        </div>

        {/* edit blog */}
        <div className="border-grey lg:border-1 lg:pl-8">
          {/* edit judul */}
          <p className="text-dark-grey mb-2 mt-9 "> Judul Blog</p>
          <input
            type="text"
            placeholder="Judul Blog"
            defaultValue={title}
            className="input-box pl-4 "
            onChange={handleBlogTitleChange}
          />

          {/* edit deskripsi */}
          <p className="text-dark-grey mb-2 mt-9">
            Deskripsi singkat tentang blog anda!
          </p>
          <textarea
            maxLength={caracterLimit}
            defaultValue={des}
            className="h-40 resize-none leading-7 input-box pl-4"
            onChange={handleBlogDescriptionChange}
            onKeyDown={handleTitleKeyDown}
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right">
            {caracterLimit - des.length} Karakter lagi
          </p>

          {/* edit topik atau tagar */}
          <p className="text-dark-grey mb-2 mt-9">Topik / Tagar</p>
          <div className="relative input-box pl-2 pb-4">
            <input
              type="text"
              placeholder="Tagar"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleTagKeyDown}
            />
            {tags.map((tag, index) => {
              return <Tag key={index} index={index} tag={tag} />;
            })}
          </div>
          {tagLimit - tags.length > 0 ? (
            <p className="text-dark-grey text-sm text-right mt-2">
              {tagLimit - tags.length} Tag lagi
            </p>
          ) : (
            <p className="text-dark-grey text-sm text-right mt-2">
              Tagar full!
            </p>
          )}

          <button className="btn-dark px-8" onClick={publishBlog}>
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishFormComponent;
