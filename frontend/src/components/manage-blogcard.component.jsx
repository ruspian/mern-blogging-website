import { Link } from "react-router-dom";
import { tanggal } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const BlogStatistik = ({ statistik }) => {

  let indo = {
    "likes": "Suka",
    "comments": "Komentar",
    "reads": "Dilihat",
  }

  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
      {
        Object.keys(statistik).map((info, index) => {
          return (
            !info.includes("parent") ?
              <div className={"flex flex-col items-center w-full h-full justify-center p-4 px-6 " + (index !== 0 ? " border-grey border-l " : "")} key={index}>
                <h1 className="text-xl lg:text-2xl mb-2">{statistik[info].toLocaleString()}</h1>
                <p className="max-lg:text-dark-grey capitalize">{indo[info.split("_")[1]]}</p>
              </div>
              :
              ""
          )
        })
      }
    </div>
  )
}

export const ManagePublishBlogCard = ({ blog }) => {

  let { banner, blog_id, title, publishedAt, activity } = blog;
  let { userAuth: { access_token } } = useContext(UserContext);

  const [ShowStats, setShowStats] = useState(false);


  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img src={banner} className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover" />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div className="">
            <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">{title}</Link>

            <p className="line-clamp-1 text-sm">Diunggah: {tanggal(publishedAt)}</p>
          </div>

          <div className="flex gap-6 mt-3">
            <Link to={`/editor/${blog_id}`} className="pr-4 py-2 hover:underline text-sm">Edit</Link>

            <button onClick={() => { setShowStats(preVal => !preVal) }} className="lg:hidden pr-4 py-2 hover:underline text-sm">Statistik</button>

            <button onClick={(event) => deleteBlog(blog, access_token, event.target)} className="pr-4 py-2 hover:underline text-red text-sm ">Hapus</button>
          </div>
        </div>

        <div className="max-lg:hidden">
          <BlogStatistik statistik={activity} />
        </div>
      </div>

      {
        ShowStats ?
          <div className="lg:hidden">
            <BlogStatistik statistik={activity} />
          </div>
          :
          ""
      }
    </>
  )
}

export const ManageDraftBlogCard = ({ blog }) => {

  let { title, des, index } = blog;

  let { userAuth: { access_token } } = useContext(UserContext);

  return (
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
        {index < 10 ? `0${index + 1}` : index + 1}
      </h1>

      <div className="">
        <h1 className="blog-title mb-3">{title}</h1>
        <p className="line-clamp-2 font-gelasio">{des.length ? des : "Tidak ada deskripsi"}</p>

        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${blog._id}`} className="pr-4 py-2 hover:underline text-sm">
            Edit
          </Link>

          <button onClick={(event) => deleteBlog(blog, access_token, event.target)} className="pr-4 py-2 hover:underline text-red text-sm ">Hapus</button>
        </div>
      </div>

    </div>
  )
}

const deleteBlog = (blog, access_token, target) => {
  let { index, blog_id, setShowStatsFunc } = blog;

  target.setAttribute("disabled", true);

  axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/hapus-blog", { blog_id }, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
    .then(({ data }) => {
      target.removeAttribute("disabled");

      setShowStatsFunc(preVal => {
        let { deletedDocCount, totalDocs, result } = preVal;

        result.splice(index, 1);

        if (!deletedDocCount) {
          deletedDocCount = 0;
        }

        if (!result.length && totalDocs - 1 > 0) {
          return null;
        }

        return { ...preVal, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1 }

      })
    })
    .catch(err => {
      console.log(err);

    })
}
