import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag, index }) => {
  let {
    blog,
    blog: { tags },
    setBlog,
  } = useContext(EditorContext);

  //   fungsi untuk edit tag yang sudah di buat
  const addEditTag = (event) => {
    event.target.setAttribute("contentEditable", true);
    event.target.focus();
  };

  //   fungsi untuk mengedit tag
  const handleEditTag = (event) => {
    if (event.keyCode === 13 || event.keyCode === 188) {
      event.preventDefault();

      let currentTag = event.target.innerText;

      tags[index] = currentTag;

      setBlog({ ...blog, tags });
      //   console.log(tags);

      event.target.setAttribute("contentEditable", false);
    }
  };

  // fungsi untuk menghapus tag
  const handleDeleteTag = () => {
    tags = tags.filter((item) => item !== tag);

    setBlog({ ...blog, tags });
  };

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacityy-50 pr-10">
      <p
        className="outline-none"
        onKeyDown={handleEditTag}
        onClick={addEditTag}
      >
        {tag}
      </p>
      <button
        className="mt-[2px] rouded-full absolute right-2 top-1/2 -translate-y-1/2"
        onClick={handleDeleteTag}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tag;
