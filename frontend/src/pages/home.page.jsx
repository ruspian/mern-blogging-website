import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCardComponent from "../components/blog-post.component";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);

  // mengambil data blog terbaru dari baackend
  const fetchLatestBlog = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blog-terbaru")
      .then(({ data }) => {
        setBlogs(data.blogs);
        // console.log(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchLatestBlog();
  });

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* blog terbaru */}
        <div className="w-full ">
          <InPageNavigation
            routes={["home", "populer"]}
            defaultHidden={["populer"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : (
                blogs.map((blog, index) => {
                  return (
                    <AnimationWrapper
                      key={index}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    >
                      <BlogPostCardComponent
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
            </>
            <h1>ini blog populer</h1>
          </InPageNavigation>
        </div>

        {/* filter dan trending blog */}
        <div className=""></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
