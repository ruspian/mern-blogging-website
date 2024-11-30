import { Link } from "react-router-dom";
import { tanggal } from "../common/date";
import { useContext, useState } from "react";
import NotificationCommentFieldComponent from "./notification-comment-field.component";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCardComponent = ({ data, index, notificationState }) => {

  const [isReplying, setIsReplying] = useState(false);

  let { seen, type, reply, createdAt, comment, replied_on_comment, user, user: { personal_info: { fullname, username, profile_img } }, blog: { _id, blog_id, title }, _id: notification_id } = data;

  let { userAuth: { username: author_username, profile_img: author_profile_img, access_token } } = useContext(UserContext);

  let { notifications, notifications: { result, totalDocs }, setNotifications } = notificationState;

  const handleReplyClick = () => {
    setIsReplying(preVal => !preVal);
  }

  const handleDeleteClick = (comment_id, type, target) => {
    target.setAttribute("disabled", true);

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/hapus-komentar",
      { _id: comment_id }, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
      .then(() => {
        if (type == "comment") {
          result.splice(index, 1);
        } else {
          delete result[index].reply;
        }

        target.removeAttribute("disabled");
        setNotifications({ ...notifications, result, totalDocs: totalDocs - 1, deletedDocCount: notifications.deletedDocCount + 1 });
      })
      .catch(err => {
        console.log(err);
      })
  }


  return (
    <div className={"p-6 border-b border-grey border-l-black " + (!seen ? "border-l-2" : "")}>
      <div className="flex gap-5 mb-3">
        <img src={profile_img} className="w-14 h-14 rounded-full flex-none" />
        <div className="w-full">
          <h1 className="font-md text-xl text-dark-grey">
            <span className="lg:inline-block hidden capitalize">{fullname}</span>
            <Link to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
            <span className="font-normal">
              {
                type === "like" ? "Menyukai Blog Anda!" :
                  type === "comment" ? "Memberikan Komentar pada Blog Anda!" :
                    "Membalas Komentar Anda!"
              }
            </span>
          </h1>

          {
            type === "reply" ?
              <div className="p-4 mt-4 rounded-md bg-grey">
                <p className="">{replied_on_comment.comment}</p>
              </div>
              :
              <Link to={`/blog/${blog_id}`} className="font-md text-dark-grey hover:underline line-clamp-1">
                {`"${title}"`}
              </Link>
          }
        </div>
      </div>

      {
        type !== "like" ?
          <p className="ml-14 pl-5 font-gelasio text-xl my-5">{comment.comment}</p>
          :
          ""
      }

      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
        <p>{tanggal(createdAt)}</p>

        {
          type !== "like" ?
            <>
              {
                !reply ?
                  <button onClick={handleReplyClick} className="hover:underline hover:text-black" >Balas</button>
                  : ""
              }
              <button onClick={(event) => handleDeleteClick(comment._id, "comment", event.target)} className="hover:underline hover:text-red">Hapus</button>
            </>
            :
            ""
        }
      </div>

      {
        isReplying ?
          <div className="mt-8">
            <NotificationCommentFieldComponent _id={_id} blog_author={user} index={index} replyingTo={comment._id} setIsReplying={setIsReplying} notification_id={notification_id} notificationData={notificationState} />
          </div>
          :
          ""
      }

      {
        reply ?
          <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
            <div className="flex gap-3 mb-3">
              <img src={author_profile_img} className="w-8 h-8 rounded-full" />
              <div className="">
                <h1 className="font-medium text-xl text-dark-grey">
                  <Link to={`/user/${author_username}`} className="mx-1 text-black underline">@{author_username}</Link>
                  <span className="font-normal">Membalas</span>
                  <Link to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
                </h1>
              </div>
            </div>

            <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

            {/* <button
              onClick={(event) => handleDeleteClick(comment._id, "reply", event.target)}
              className="hover:underline hover:text-red ml-14 mt-2"
            >Hapus
            </button> */}
          </div>
          :
          ""
      }
    </div>
  )
}

export default NotificationCardComponent;