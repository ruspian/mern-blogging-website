import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentsField = ({ action, index = undefined, replyingTo = undefined, setIsReplying }) => {

    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext)
    let { blog, blog: { _id, author: { _id: blog_author }, comments, comments: { result: commentsArray }, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalCommentsLoaded } = useContext(BlogContext);

    const [comment, setComment] = useState("");

    const handleComment = () => {

        if (!access_token) {
            return toast.error("Silahkan login dahulu!")
        }

        if (!comment.length) {
            return toast.error("Tuliskan komentar anda!")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/komentar",
            { _id, comment, blog_author, replying_to: replyingTo },
            { headers: { Authorization: `Bearer ${access_token}` } })
            .then(({ data }) => {

                setComment("");

                data.commented_by = {
                    personal_info: {
                        username,
                        profile_img,
                        fullname
                    }
                }

                let newCommentArray;

                if (replyingTo) {
                    // komentar balasan
                    commentsArray[index].children.push(data._id);

                    data.childrenLevel = commentsArray[index].childrenLevel + 1;
                    data.parentIndex = index;

                    commentsArray[index].isReplyLoaded = true;

                    commentsArray.splice(index + 1, 0, data);

                    newCommentArray = commentsArray;

                    setIsReplying(false);
                } else {

                    data.childrenLevel = 0;

                    newCommentArray = [data, ...commentsArray];
                }


                let parentCommentIncrementVal = replyingTo ? 0 : 1;

                setBlog({ ...blog, comments: { ...comments, result: newCommentArray }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal } })

                setTotalCommentsLoaded(preVal => preVal + parentCommentIncrementVal)


            }).catch(err => {
                console.log(err);
            })

    }

    return (
        <>
            <Toaster />
            <textarea value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tulis komentar disini..."
                className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto">
            </textarea>

            <button className="btn-dark mt-5 px-10 text-white" onClick={handleComment}> {action} </button>
        </>
    )
};

export default CommentsField;