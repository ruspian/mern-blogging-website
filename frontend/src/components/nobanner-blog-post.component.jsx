import { Link } from "react-router-dom";
import { tanggal } from "../common/date";

const PopulerBlogPostComponent = ({ blog, index }) => {
  let {
    title,
    blog_id: id,
    author: {
      personal_info: { fullname, username, profile_img },
    },
    publishedAt,
  } = blog;

  return (
    <Link to={`/blog/${id}`} className="flex gap-5 mb-8">
      <h1 className="blog-index">{index < 10 ? `0${index + 1}` : index}</h1>

      <div>
        {/* profil, nama, user dan tanggal publish */}
        <div className="flex gap-2 items-center mb-7">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1 font-semibold">
            {fullname} @{username}
          </p>
          <p className="min-w-fit text-dark-grey text-sm text-right">
            {tanggal(publishedAt)}
          </p>
        </div>

        {/* judul blog */}
        <h1 className="blog-title"> {title} </h1>
      </div>
    </Link>
  );
};

export default PopulerBlogPostComponent;
