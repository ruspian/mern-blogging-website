import { useContext, useState } from "react";
import { tanggal } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentsField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";

const CommentsCardComponent = ({ index, leftVal, commentData }) => {

    let { commented_by: { personal_info: { fullname, username, profile_img } }, commentedAt, comment, _id } = commentData;

    let { blog, blog: { comments: { result: commentsArray } }, setBlog } = useContext(BlogContext);

    let { userAuth: { access_token } } = useContext(UserContext)

    const [isReplying, setIsReplying] = useState(false);


    const removeCommentCards = (startingPoint) => {

        if (commentsArray[startingPoint]) {
            while (commentsArray[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArray.splice(startingPoint, 1);

                if (!commentsArray[startingPoint]) {
                    break;
                }
            }


        }

        setBlog({ ...blog, comments: { result: commentsArray } })

    }


    const handleHideComments = () => {
        commentData.isReplyLoaded = false;

        removeCommentCards(index + 1)
    }

    const handleReply = () => {
        if (!access_token) {
            return toast.error("Silahkan login dahulu!");
        }

        setIsReplying(preVal => !preVal);

    }



    return (

        <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} className="w-6 h-6 rounded-full " />
                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit text-sm">{tanggal(commentedAt)}</p>
                </div>

                <p className="font-gelasio text-xl ml-3"> {comment} </p>

                <div className="flex gap-5 items-center text-sm mt-5">

                    {
                        commentData.isReplyLoaded ?
                            <button
                                onClick={handleHideComments}
                                className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2">
                                <i className="fi fi-br-comment-alt-minus"></i>
                                Sembunyikan
                            </button>
                            :
                            ""
                    }

                    <button className="underline" onClick={handleReply}>Balas</button>
                </div>

                {
                    isReplying ?
                        <div className="mt-8">
                            <CommentsField action="Balas" index={index} replyingTo={_id} setIsReplying={setIsReplying} />
                        </div>
                        :
                        ""
                }
            </div>
        </div>
    )
}

export default CommentsCardComponent;