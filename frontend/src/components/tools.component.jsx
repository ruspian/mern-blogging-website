// import tools untuk editor blog
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Code from "@editorjs/code";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import axios from "axios";

const uploadImageByFile = async (file) => {
  try {
    if (!file) {
      throw new Error("File tidak valid");
    }

    // Membuat FormData untuk mengirim file
    const formData = new FormData();
    formData.append("image", file);

    // Kirim URL ke server jika diperlukan (opsional)
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

    // Kembalikan data dalam format yang diminta Editor.js
    return {
      success: 1,
      file: {
        url: fullPath, // URL gambar
      },
    };
  } catch (error) {
    console.log(error);

    return {
      success: 0,
      message: "Gagal mengunggah gambar",
    };
  }
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: null,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  code: Code,
  header: {
    class: Header,
    config: {
      placeholder: "Ketikkan Heading disini",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
