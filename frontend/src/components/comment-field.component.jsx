import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentsField = ({ action }) => {

    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext)
    let { blog, blog: { _id, author: { _id: blog_author }, comments, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalCommentsLoaded } = useContext(BlogContext);

    const [comment, setComment] = useState("");

    const handleComment = () => {



        if (!access_token) {
            return toast.error("Silahkan login dahulu!")
        }

        if (!comment.length) {
            return toast.error("Tuliskan komentar anda!")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/komentar",
            { _id, comment, blog_author },
            { headers: { Authorization: `Bearer ${access_token}` } })
            .then(({ data }) => {
                setComment("");

                data.commeted_by = {
                    personal_info: {
                        username,
                        profile_img,
                        fullname
                    }
                }

                let newCommentArray;
                data.childrenLevel = 0;

                newCommentArray = [data];

                let parentCimmentIncrementVal = 1;

                setBlog({ ...blog, comment: { ...comments, result: newCommentArray }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCimmentIncrementVal } })

                setTotalCommentsLoaded(preVal => preVal + parentCimmentIncrementVal)


            }).then(err => {
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