import { useContext, useState } from "react";
import { tanggal } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentsField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentsCardComponent = ({ index, leftVal, commentData }) => {

    let { commented_by: { personal_info: { fullname, username: commented_by_username, profile_img } }, commentedAt, comment, _id, children } = commentData;

    let { blog, blog: { comments, activity, activity: { total_parent_comments }, comments: { result: commentsArray }, author: { personal_info: { username: blog_author } } }, setBlog, setTotalCommentsLoaded } = useContext(BlogContext);

    let { userAuth: { access_token, username } } = useContext(UserContext)

    const [isReplying, setIsReplying] = useState(false);



    const getParentIndex = () => {
        let startingPoint = index - 1;

        try {
            while (commentsArray[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        } catch {
            startingPoint = undefined;
        }

        return startingPoint;
        // console.log(startingPoint);
    }


    // fungsi sembunyikan balasan komentar
    const removeCommentCards = (startingPoint, isDelete = false) => {

        if (commentsArray[startingPoint]) {
            while (commentsArray[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArray.splice(startingPoint, 1);

                if (!commentsArray[startingPoint]) {
                    break;
                }
            }
        }

        if (isDelete) {
            let parentIndex = getParentIndex();

            if (parentIndex !== undefined) {
                commentsArray[parentIndex].children = commentsArray[parentIndex].children.filter(child => child !== _id);

                if (!commentsArray[parentIndex].children.length) {
                    commentsArray[parentIndex].isReplyLoaded = false;
                }
            }

            commentsArray.splice(index, 1);
        }

        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalCommentsLoaded(preVal => preVal - 1);
        }

        setBlog({
            ...blog, comments: { result: commentsArray },
            activity: { ...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel === 0 && isDelete ? 1 : 0) }
        })

    }


    const loadReplies = ({ skip = 0, currentIndex = index }) => {

        if (commentsArray[currentIndex].children.length) {

            handleHideComments();

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/balas-komentar", { _id: commentsArray[currentIndex]._id, skip })
                .then(({ data: { replies } }) => {

                    commentsArray[currentIndex].isReplyLoaded = true;

                    for (let i = 0; i < replies.length; i++) {
                        replies[i].childrenLevel = commentsArray[currentIndex].childrenLevel + 1;

                        commentsArray.splice(currentIndex + 1 + i + skip, 0, replies[i]);
                    }

                    setBlog({ ...blog, comments: { ...comments, result: commentsArray } })
                }).catch(err => {
                    console.log(err);
                })
        }
    }


    const deleteComment = (event) => {
        // buat tombol hanya bisa di klik sekali
        event.target.setAttribute("disabled", true);

        // console.log(blog_author);


        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/hapus-komentar",
            { _id },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }).then(() => {

                event.target.removeAttribute("disabled");

                removeCommentCards(index + 1, true);

            }).catch(err => {
                console.log(err);
            })
    }


    // fungsi sembunyikan komentar
    const handleHideComments = () => {
        commentData.isReplyLoaded = false;

        removeCommentCards(index + 1)
    }


    // fungsi balas komentar
    const handleReply = () => {
        if (!access_token) {
            return toast.error("Silahkan login dahulu!");
        }

        setIsReplying(preVal => !preVal);

    }


    const LoadMoreRepliesBtn = () => {

        let parentIndex = getParentIndex();

        let button = <button
            onClick={() => loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })}
            className="text-dark-grey text-sm p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2">
            <i className="fi fi-br-eye"></i> Tampilkan Lainnya</button>

        if (commentsArray[index + 1]) {

            if (commentsArray[index + 1].childrenLevel < commentsArray[index].childrenLevel) {
                if ((index - parentIndex) < commentsArray[parentIndex].children.length) {

                    return button;
                }


            }
        } else {
            if (parentIndex) {
                if ((index - parentIndex) < commentsArray[parentIndex].children.length) {

                    return button;
                }
            }
        }
    }



    return (

        <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} className="w-6 h-6 rounded-full " />
                    <p className="line-clamp-1">{fullname} @{commented_by_username}</p>
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
                            <button
                                onClick={loadReplies}
                                className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2">
                                <i className="fi fi-br-comment-alt-minus"></i>
                                {children.length} Balasan
                            </button>
                    }

                    <button
                        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md hover:underline flex items-center gap-2"
                        onClick={handleReply}>
                        Balas
                    </button>

                    {
                        username === commented_by_username || username === blog_author ?
                            // tombol hapus
                            <button
                                className="text-black p-2 px-3 ml-auto hover:bg-red/30 hover:text-red rounded-md border border-grey flex items-center gap-2"
                                onClick={deleteComment}>
                                <i className="fi fi-br-trash pointer-events-none"></i>
                            </button>
                            :
                            ""
                    }
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

            <LoadMoreRepliesBtn />
        </div>
    )
}

export default CommentsCardComponent;