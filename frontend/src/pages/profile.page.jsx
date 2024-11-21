import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUserComponent from "../components/about.component";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCardComponent from "../components/blog-post.component";
import NoDataMessageComponent from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import PageNotFound from "./404.page";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_blogs: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilPage = () => {
  let { id: profileId } = useParams();

  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState("");

  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  let {
    userAuth: { username },
  } = useContext(UserContext);

  const fetchUserProfil = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/profil", {
        username: profileId,
      })
      .then(({ data: user }) => {
        // console.log(user);

        if (user !== null) {
          setProfile(user);
        }

        setProfileLoaded(profileId);
        getBlogs({ user_id: user._id });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/cari-blog", {
        page,
        author: user_id,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/blog-kategori",
          data_to_send: { author: user_id },
        });

        formatedData.user_id = user_id;
        // console.log(formatedData);

        setBlogs(formatedData);
      });
  };

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
    }

    if (blogs === null) {
      resetState();
      fetchUserProfil();
    }
  }, [profileId, blogs]);

  const resetState = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />

            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>

            <p className="">
              {total_posts.toLocaleString()} Blog dibuat -{" "}
              {total_reads.toLocaleString()} Dibaca
            </p>

            <div className="flex gap-4 mt-2 ">
              {profileId === username ? (
                <Link
                  to="/pengaturan/edit-profil"
                  className="btn-light rounded-md"
                >
                  Edit Profil
                </Link>
              ) : (
                ""
              )}
            </div>

            <AboutUserComponent
              className="max-md:hidden"
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>

          <div className="max-md:mt-12 w-full">
            <InPageNavigation
              routes={["blog yang dibuat", "tentang user"]}
              defaultHidden={["tentang user"]}
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

                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
              </>

              <AboutUserComponent
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilPage;
