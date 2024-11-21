import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export const blogDataStructure = {
  title: "",
  des: "",
  content: [],
  tags: [],
  author: {
    personal_info: {},
  },
  banner: "",
  publishedAt: "",
};

const BlogPage = () => {
  let { blog_id } = useParams();

  let [blog, setBlog] = useState(blogDataStructure);

  let {
    title,
    conten,
    banner,
    author: {
      personal_info: { fullname, profile_img, username },
    },
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/blog", { blog_id })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        // console.log(blog);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  return (
    <div>
      <h1>Blog Page - {blog.title}</h1>
    </div>
  );
};

export default BlogPage;
