import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { activeTab } from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCardComponent from "../components/blog-post.component";
import PopulerBlogPostComponent from "../components/nobanner-blog-post.component";
import NoDataMessageComponent from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);

  let [populerBlog, setPopulerBlog] = useState(null);
  let [pageState, setPageState] = useState("home");

  let categories = [
    "programing",
    "berita",
    "sosial media",
    "memasak",
    "teknologi",
    "bisnis",
    "travel",
    "gaya hidup",
    "pendidikan",
    "inspirasi",
    "keluarga",
    "sosial",
    "hobi & hiburan",
  ];

  // mengambil data blog terbaru dari baackend
  const fetchLatestBlog = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/blog-terbaru", { page })
      .then(async ({ data }) => {
        // console.log(data.blogs);

        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page: 1,
          countRoute: "/semua-blog-terbaru",
        });

        // console.log(formatedData);
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // mengambil data kategori dari backend
  const fetchBlogByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/cari-blog", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/blog-kategori",
          data_to_send: { tag: pageState },
        });

        // console.log(formatedData);
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };



  // mengambil data blog terpopuler dari baackend
  const fetchPopulerBlog = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blog-terpopuler")
      .then(({ data }) => {
        setPopulerBlog(data.blogs);
        // console.log(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // fungsi tetika tombol kategori di klik
  const loadBlogByCategory = (event) => {
    let category = event.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  useEffect(() => {
    activeTab.current.click();

    if (pageState == "home") {
      fetchLatestBlog({ page: 1 });
    } else {
      fetchBlogByCategory({ page: 1 });
    }

    if (!populerBlog) {
      fetchPopulerBlog();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* blog terbaru */}
        <div className="w-full ">
          <InPageNavigation
            routes={[pageState, "populer"]}
            defaultHidden={["populer"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs.result.length ? (
                blogs.result.map((blog, index) => {
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
              ) : (
                <NoDataMessageComponent message="Blog kosong!" />
              )}

              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState === "home" ? fetchLatestBlog : fetchBlogByCategory
                }
              />
            </>

            {/* blog terpopuler */}
            {populerBlog === null ? (
              <Loader />
            ) : populerBlog.length ? (
              populerBlog.map((blog, index) => {
                return (
                  <AnimationWrapper
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <PopulerBlogPostComponent blog={blog} index={index} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessageComponent message="Tidak ada blog populer!" />
            )}
          </InPageNavigation>
        </div>

        {/* filter dan trending blog */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            {/* kategori */}
            <div className="">
              <h1 className="font-medium text-xl mb-8">
                Temukan blog yang anda suka
                <i className="fi fi-bs-search-alt pl-2"></i>
              </h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category, index) => {
                  return (
                    <button
                      onClick={loadBlogByCategory}
                      className={
                        "tag " +
                        (pageState == category ? " bg-black text-white " : "")
                      }
                      key={index}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="">
              <h1 className="font-medium text-xl mb-8">
                Blog Terpopuler <i className="fi fi-br-sort-amount-up-alt"></i>
              </h1>

              {/* populer blog */}
              {populerBlog === null ? (
                <Loader />
              ) : populerBlog ? (
                populerBlog.map((blog, index) => {
                  return (
                    <AnimationWrapper
                      key={index}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    >
                      <PopulerBlogPostComponent blog={blog} index={index} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessageComponent message="Tidak ada blog populer!" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
