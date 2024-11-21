import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { tanggal } from "../common/date";
import BlogInteractionComponent from "../components/blog-interaction.component";

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
  let [loading, setLoading] = useState(true);

  let {
    title,
    conten,
    banner,
    author: {
      personal_info: { fullname, profile_img, username: author_username },
    },
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/blog", { blog_id })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        setLoading(false);
        // console.log(blog);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  return (
    <AnimationWrapper transition={{ duration: 0.2 }}>
      {loading ? (
        <Loader />
      ) : (
        <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
          <img src={banner} className="aspevt-video" />

          <div className="mt-12">
            <h2 className="">{title}</h2>

            <div className="flex max-sm:flex-col justify-between my-8">
              <div className="flex gap-5 items-start">
                <img src={profile_img} className="w-12 h-12 rounded-full" />

                <p className="capitalize">
                  {fullname} <br />@
                  <Link to={`/user/${author_username}`} className="underline">
                    {author_username}
                  </Link>
                </p>
              </div>

              <p className="text-sm opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5 text-dark-grey">
                Diunggah: {tanggal(publishedAt)}
              </p>
            </div>
          </div>

          <BlogInteractionComponent />
        </div>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
