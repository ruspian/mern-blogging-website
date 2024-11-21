import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

const BlogInteractionComponent = () => {
  let {
    blog: {
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
  } = useContext(BlogContext);

  let {
    userAuth: { username },
  } = useContext(UserContext);

  return (
    <>
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
            <i className="fi fi-rr-heart"></i>
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey">
            <i className="fi fi-rr-message-quote"></i>
          </button>
          <p className="-dartext-dark-grey-xl text-dark-grey">
            {total_comments}
          </p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username ? (
            <Link
              to={`/edit/${blog_id}`}
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
