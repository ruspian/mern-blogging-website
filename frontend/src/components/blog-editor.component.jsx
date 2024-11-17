import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import axios from "axios";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const EditorFormComponent = () => {
  // Deklarasikan state untuk menyimpan preview gambar
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [blogData, setBlogData] = useState({
    title: "",
    des: "",
    content: "",
    tags: [],
    draft: false,
  });

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
    setImagePreview(previewUrl);
    toast.dismiss(toastLoading);
    toast.success("Gambar berhasil diunggah");
    setSelectedImage(img); // Menyimpan file yang dipilih ke state
  };

  // Handle ketika tombol Publish diklik
  const handlePublish = async () => {
    if (!selectedImage) {
      toast.error("Pilih gambar terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("title", blogData.title);
    formData.append("des", blogData.des);
    formData.append("content", blogData.content);
    formData.append("tags", blogData.tags);
    formData.append("draft", blogData.draft);

    try {
      const response = await axios.post(
        "http://localhost:3000/create-blog",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Blog berhasil diterbitkan:", response.data);
      toast.success("Blog berhasil diterbitkan");
      // Reset form setelah publish atau arahkan ke halaman lain
    } catch (error) {
      toast.error(error);
    }
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
          <button className="btn-dark py-2" onClick={handlePublish}>
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
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="z-20"
                    alt="Banner Preview"
                  />
                ) : (
                  <img
                    src={defaultBanner}
                    className="z-20"
                    alt="Default Banner"
                  />
                )}
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
