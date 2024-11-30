import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentFieldComponent = ({ _id, blog_author, index = undefined, replyingTo = undefined, setIsReplying, notification_id, notificationData }) => {

  let [comment, setComment] = useState("");

  let { _id: user_id } = blog_author;
  let { userAuth: { access_token } } = useContext(UserContext);
  let { notifications, notifications: { result }, setNotifications } = notificationData;

  const handleComment = () => {
    // console.log("klik");

    if (!comment.length) {
      return toast.error("Balasan kosong, coba lagi!")
    }

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/komentar",
      { _id, comment, blog_author: user_id, replying_to: replyingTo, notification_id },
      { headers: { Authorization: `Bearer ${access_token}` } })
      .then(({ data }) => {
        // console.log(data);
        setIsReplying(false);

        result[index].reply = { comment, _id: data._id };

        setNotifications({
          ...notifications,
          result
        })

      }).catch(err => {
        console.log(err);
      })

  }

  return (
    <>
      <Toaster />
      <textarea value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Balas komentar..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto">
      </textarea>

      <button className="btn-dark mt-5 px-10 text-white" onClick={handleComment}>Balas</button>
    </>
  )
}

export default NotificationCommentFieldComponent;