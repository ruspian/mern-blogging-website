import { Link } from "react-router-dom";
import { tanggal } from "../common/date";

const BlogPostCardComponent = ({ content, author }) => {
  // ambil sruktur blog
  let {
    publishedAt,
    tags,
    title,
    banner,
    des,
    activity: { total_likes },
    blog_id: id,
  } = content;

  //   ambil sruktur author/user
  let { username, fullname, profile_img } = author;

  return (
    <Link
      to={`/blog/${id}`}
      className="flex gap-8 items-center border-b border-grey pb-5 mb-4"
    >
      <div className="w-full ">
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
        <h1 className="blog-title">{title}</h1>

        {/* deskripsi blog */}
        <p className="my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">
          {des}
        </p>

        {/* tag  */}
        <div className="flex gap-4 mt-7">
          <span className="btn-light py-1 px-4">{tags[0]}</span>
          <span className="ml-3 flex items-center gap-2 text-dark-grey">
            <i className="fi fi-rr-heart text-xl"></i>
            {total_likes}
          </span>
        </div>
      </div>

      <div className="h-28 aspect-square bg-grey">
        <img
          src={banner}
          className="w-full h-full aspect-square object-cover"
        />
      </div>
    </Link>
  );
};

export default BlogPostCardComponent;
