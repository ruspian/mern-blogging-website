import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentsField from "./comment-field.component";
import axios from "axios";
import NoDataMessageComponent from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentsCardComponent from "./comment-card.component";


export const fetchComments = async ({ skip = 0, blog_id, setParentCommentsCountFunc, comment_array = null }) => {

    let res;

    await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog-komentar", { skip, blog_id }).then(({ data }) => {
        data.map(comment => {
            comment.childrenLevel = 0;
        })

        setParentCommentsCountFunc(preVal => preVal + data.length);

        if (comment_array === null) {
            res = { result: data };
        } else {
            res = { result: [...comment_array, ...data] }
        }


    })

    return res;

}

const CommentsContainer = () => {

    let { blog, blog: { _id, title, comments: { result: commentsArray }, activity: { total_parent_comments } }, commentsWrapper, setCommentsWrapper, totalCommentsLoaded, setTotalCommentsLoaded, setBlog } = useContext(BlogContext);

    // console.log(commentsWrapper);
    // console.log(commentsArray);


    const loadMoreComment = async () => {
        let newCommentsArray = await fetchComments({ skip: totalCommentsLoaded, blog_id: _id, setParentCommentsCountFunc: setTotalCommentsLoaded, comment_array: commentsArray });

        setBlog({ ...blog, comments: newCommentsArray })
    }


    return (
        <div className={"max-sm:w-full fixed " + (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") + " duration-700 max-sm:right-0 top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-auto overflow-x-hidden"}>

            <div className="relative">
                <h1 className="text-xl font-medium">Komentar</h1>
                <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1"> {title} </p>

                <button onClick={() => setCommentsWrapper(commentsWrapper => !commentsWrapper)}
                    className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bgg-grey">
                    <i className="fi fi-br-cross text-2xl mt-1"></i>
                </button>
            </div>

            <hr className="border-grey my-8 w-[120%] -ml-10" />

            <CommentsField action="Kirim Komentar" />

            {
                commentsArray && commentsArray.length ?
                    commentsArray.map((comment, index) => {
                        return <AnimationWrapper key={index} transition={{ duration: 1, delay: index * 0.1 }}>
                            <CommentsCardComponent index={index} leftVal={comment.childrenLevel * 4} commentData={comment} />
                        </AnimationWrapper>
                    }) : <NoDataMessageComponent message="Belum ada komentar!" />
            }

            {
                total_parent_comments > totalCommentsLoaded ?
                    <button onClick={loadMoreComment} className="textdatk-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2">Muat Lebih Banyak</button>
                    :
                    ""
            }

        </div>
    )
};

export default CommentsContainer;