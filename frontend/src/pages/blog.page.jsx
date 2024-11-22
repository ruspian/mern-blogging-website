import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { tanggal } from "../common/date";
import BlogInteractionComponent from "../components/blog-interaction.component";
import BlogPostCardComponent from "../components/blog-post.component";
import BlogContentComponent from "../components/blog-content.component";

export const blogDataStructure = {
  title: "",
  des: "",
  content: [],
  author: {
    personal_info: {},
  },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  let { blog_id } = useParams();

  let [blog, setBlog] = useState(blogDataStructure);
  let [similarBlogs, setSimilarBlogs] = useState(null);
  let [loading, setLoading] = useState(true);

  let {
    title,
    content,
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
        // console.log(blog.content);

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/cari-blog", {
            tag: blog.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
            // console.log(data.blogs);
          })
          .catch((err) => {
            console.log(err);
          });

        setLoading(false);
        // console.log(blog);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, []);

  const resetState = () => {
    setBlog(blogDataStructure);
    setSimilarBlogs(null);
    setLoading(true);
  };

  return (
    <AnimationWrapper transition={{ duration: 0.2 }}>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={{ blog, setBlog }}>
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

            {/* konten blog akan ada di sini */}
            <div className="my-12 font-gelasio blog-page-content">
              {content[0].blocks.map((block, index) => {
                return (
                  <div key={index} className="my-4 md:my-8">
                    <BlogContentComponent block={block} />
                  </div>
                );
              })}
            </div>

            <BlogInteractionComponent />

            {similarBlogs !== null && similarBlogs.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Blog Serupa
                </h1>

                {similarBlogs.map((blog, index) => {
                  let {
                    author: { personal_info },
                  } = blog;

                  return (
                    <AnimationWrapper
                      key={index}
                      transition={{ duration: 1, delay: index * 0.08 }}
                    >
                      <BlogPostCardComponent
                        content={blog}
                        author={personal_info}
                      />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              ""
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
