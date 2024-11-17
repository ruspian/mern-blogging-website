import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
// import axios from "axios";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";

const EditorFormComponent = () => {
  // kontext editor
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  //  hook
  useEffect(() => {
    setTextEditor(
      new EditorJS({
        holder: "textEditor",
        data: "",
        tools: tools,
        placeholder: "Tuliskan konten menarik anda disini...",
      })
    );
  }, []);

  // Handle ketika file gambar dipilih
  const handleUploadBanner = async (event) => {
    const img = event.target.files[0];

    const toastLoading = toast.loading("Mengunggah gambar...");

    if (!img) {
      toast.error("Pilih gambar terlebih dahulu");
      return;
    }

    try {
      // Buat form-data untuk mengirim file
      const formData = new FormData();
      formData.append("image", img);

      // Kirim permintaan ke server
      const response = await axios.post(
        "http://localhost:3000/image-url",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { filePath } = response.data;
      const fullPath = import.meta.env.VITE_SERVER_DOMAIN + filePath;

      // Set preview URL dan simpan file path dari server ke state
      setBlog({ ...blog, banner: fullPath });

      toast.dismiss(toastLoading);
      toast.success("Gambar berhasil diunggah!");
    } catch (error) {
      toast.dismiss(toastLoading);
      toast.error("Gagal mengunggah gambar");
    }
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

  // fungsi handle ketika tombol publish diklik
  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Maaf gambar belum diunggah!");
    }

    if (!title.length) {
      return toast.error("Maaf judul belum diisi!");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Tuliskan Sesuatu dalan blog anda!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

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
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Terbitkan
          </button>
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

            <div className="font-gelasio" id="textEditor" />
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default EditorFormComponent;
