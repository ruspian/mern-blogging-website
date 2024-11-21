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
import UserCardComponent from "../components/usercard.component";

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
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/cari-pengguna", { query })
      .then(({ data: { users } }) => {
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

  const UserCardWrapper = () => {
    return (
      <>
        {users === null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, index) => {
            return (
              <AnimationWrapper
                key={index}
                transition={{ duration: 1, delay: index * 0.08 }}
              >
                <UserCardComponent user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessageComponent message="User tidak ditemukan!" />
        )}
      </>
    );
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
              <NoDataMessageComponent message="Blog tidak ditemukan!" />
            )}

            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3max-md:hidden">
        <h1 className="font-medium text-xl mb-8">
          Pencarian Pengguna Yang Cocok{" "}
          <i className="fi fi-rr-user pl-1 mt-1"></i>
        </h1>

        <UserCardWrapper />
      </div>
    </section>
  );
};

export default SearchPage;
