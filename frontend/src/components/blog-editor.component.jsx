import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
// import axios from "axios";
import { useContext, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";

const EditorFormComponent = () => {
  // kontext editor
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
  } = useContext(EditorContext);

  console.log(blog);

  // Handle ketika file gambar dipilih
  const handleUploadBanner = (event) => {
    const img = event.target.files[0];

    const toastLoading = toast.loading("Mengunggah gambar...");

    if (!img) {
      toast.error("Pilih gambar terlebih dahulu");
      return;
    }

    // Membuat URL sementara untuk gambar dan menampilkannya
    const previewUrl = URL.createObjectURL(img);

    toast.dismiss(toastLoading);
    toast.success("Gambar berhasil diunggah");

    setBlog({ ...blog, banner: previewUrl }); // simpan ke state
  };

  // fungsi handle mematikan tombol enter
  const handleTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  // fungsi handle ganti judul
  const handleTitleChange = (event) => {
    const input = event.target;

    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;

    setBlog({ ...blog, title: input.value });
  };

  // fungsi error banner
  const handleErrorBanner = (event) => {
    const img = event.target;

    img.src = defaultBanner;
  };

  // Handle ketika tombol Publish diklik
  // const handlePublish = async () => {
  //   if (!selectedImage) {
  //     toast.error("Pilih gambar terlebih dahulu");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("image", selectedFile);
  //   formData.append("title", blogData.title);
  //   formData.append("des", blogData.des);
  //   formData.append("content", blogData.content);
  //   formData.append("tags", blogData.tags);
  //   formData.append("draft", blogData.draft);

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:3000/create-blog",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     console.log("Blog berhasil diterbitkan:", response.data);
  //     toast.success("Blog berhasil diterbitkan");
  //     // Reset form setelah publish atau arahkan ke halaman lain
  //   } catch (error) {
  //     toast.error(error);
  //   }
  // };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="" />
        </Link>

        <p className="max-md:hidden trxt-black line-clamp-1 w-full">
          {title.length ? title : "Blog Baru"}
        </p>

        <div className="flex gap-4 ml-auto ">
          <button className="btn-dark py-2">Terbitkan</button>
          <button className="btn-light py-2">Simpan Draft</button>
        </div>
        <Toaster />
      </nav>

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  className="z-20"
                  alt="Banner Preview"
                  onError={handleErrorBanner}
                />

                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png .jpg .jpeg"
                  hidden
                  onChange={handleUploadBanner}
                />
              </label>
            </div>
            <textarea
              placeholder="Judul Blog"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default EditorFormComponent;
