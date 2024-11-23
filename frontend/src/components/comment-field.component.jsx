import { useState } from "react";

const CommentsField = ({ action }) => {

    const [comment, setComment] = useState("");

    return (
        <>
            <textarea value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tulis komentar disini..."
                className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto">
            </textarea>

            <button className="btn-dark mt-5 px-10 text-white"> {action} </button>
        </>
    )
};

export default CommentsField;