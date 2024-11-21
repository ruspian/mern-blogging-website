import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCardComponent from "../components/blog-post.component";
import NoDataMessageComponent from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";

const SearchPage = () => {
  let { query } = useParams();

  let [blogs, setBlogs] = useState(null);
  let [users, setUsers] = useState(null);

  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/cari-blog", { query, page })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/blog-kategori",
          data_to_send: { query },
          create_new_arr,
        });

        // console.log(query, formatedData);
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchSearchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/cari-blog", { query })
      .then(async ({ data: { users } }) => {
        setUsers(users);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchSearchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Hasil Pencarian "${query}"`, "Rekomendasi User"]}
          defaultHidden={["Rekomendasi User"]}
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

            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
          </>
        </InPageNavigation>
      </div>
    </section>
  );
};

export default SearchPage;
