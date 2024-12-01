import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessageComponent from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import { ManagePublishBlogCard, ManageDraftBlogCard } from "../components/manage-blogcard.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";

const BlogManagementPage = () => {

  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  let activeTab = useSearchParams()[0].get("tab") || "drafts";

  let { userAuth: { access_token } } = useContext(UserContext);

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-blog", { page, draft, query, deletedDocCount }, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
      .then(async ({ data }) => {

        // console.log(data);

        let formatedData = await filterPaginationData({
          state: draft ? drafts : blogs,
          data: data.blogs, page,
          user: access_token,
          countRoute: "/user-blog-count",
          data_to_send: {
            draft,
            query
          }
        })

        // console.log(formatedData);

        if (draft) {
          setDrafts(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch(err => {
        console.log(err);
      })
  }

  useEffect(() => {

    if (access_token) {
      if (blogs == null) {
        getBlogs({ page: 1, draft: false });
      }

      if (drafts == null) {
        getBlogs({ page: 1, draft: true });
      }
    }

  }, [access_token, blogs, drafts, query]);

  const handleSearch = (event) => {

    let searchQuery = event.target.value;

    setQuery(searchQuery);

    if (event.key === "enter" && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  }

  const handleChange = (event) => {
    if (event.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  }

  return (
    <>
      <h1 className="max-md:hidden">Kelola Blog</h1>

      <Toaster />

      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-lg placeholder:text-dark-grey"
          placeholder="Cari Blog"
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <i className="fi fi-rr-search-alt absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl"></i>
      </div>

      <InPageNavigation routes={["Blog", "Draft"]} defaultActiveIndex={activeTab !== "draft" ? 0 : 1}>

        { // blog publish
          blogs === null ? <Loader />
            :
            blogs.result.length ?
              <>
                {
                  blogs.result.map((blog, index) => {
                    return (
                      <AnimationWrapper key={index} transition={{ delay: index * 0.04 }} >
                        <ManagePublishBlogCard blog={{ ...blog, index: index, setShowStatsFunc: setBlogs }} />
                      </AnimationWrapper>
                    )
                  })
                }

                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} additionalParam={{ draft: false, deletedDocCount: blogs.deletedDocCount }} />

              </>
              :
              <NoDataMessageComponent message="Belum ada blog" />
        }

        { // blog draft
          drafts === null ? <Loader />
            :
            drafts.result.length ?
              <>
                {
                  drafts.result.map((blog, index) => {
                    return (
                      <AnimationWrapper key={index} transition={{ delay: index * 0.04 }} >
                        <ManageDraftBlogCard blog={{ ...blog, index: index, setShowStatsFunc: setDrafts }} />
                      </AnimationWrapper>
                    )
                  })
                }

                <LoadMoreDataBtn state={drafts} fetchDataFun={getBlogs} additionalParam={{ draft: true, deletedDocCount: drafts.deletedDocCount }} />

              </>
              :
              <NoDataMessageComponent message="Tidak ada Draft" />
        }

      </InPageNavigation>

    </>
  )
};

export default BlogManagementPage;