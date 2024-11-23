import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogInteractionComponent = () => {
  let {
    blog, blog: {
      _id, title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog, isLike, setIsLike, setCommentsWrapper,
  } = useContext(BlogContext);

  let {
    userAuth: { username, access_token },
  } = useContext(UserContext);


  useEffect(() => {
    if (access_token) {
      // cek apakah user sudah like blog ini
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id }, { headers: { Authorization: `Bearer ${access_token}` } }).then(({ data: { result } }) => {
        // console.log(result);

        setIsLike(Boolean(result));

      }).catch(err => {
        console.log(err);
      })
    }
  }, [])


  const handleLike = () => {
    if (access_token) {
      // like blog
      // console.log("like blog");
      setIsLike(preVal => !preVal);

      !isLike ? total_likes++ : total_likes--;

      setBlog({ ...blog, activity: { ...activity, total_likes } })


      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", {
        _id, isLike
      }, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }).then(({ data }) => {
        console.log(data);
      }).catch(err => {
        console.log(err);
      })

    } else {
      // belum login
      toast.error("Anda belum login!");
    }
  }

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button onClick={handleLike} className={"w-10 h-10 rounded-full flex items-center justify-center " + (isLike ? "bg-red/20 text-red" : "bg-grey/80")}>
            <i className={isLike ? "fi fi-sr-heart" : "fi fi-rr-heart"}></i>
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button onClick={() => setCommentsWrapper(commentsWrapper => !commentsWrapper)} className="w-10 h-10 rounded-full flex items-center justify-center bg-grey">
            <i className="fi fi-rr-message-quote"></i>
          </button>
          <p className="-dartext-dark-grey-xl text-dark-grey">
            {total_comments}
          </p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline text-sm hover:text-twitter"
            >
              Edit Blog
            </Link>
          ) : (
            ""
          )}

          <Link
            to={`https://wa.me/?text=${encodeURIComponent(
              "http://localhost:5173/blog/" + blog_id
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fi fi-brands-whatsapp text-xl hover:text-whatsapp"></i>
          </Link>
        </div>
      </div>
      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteractionComponent;
