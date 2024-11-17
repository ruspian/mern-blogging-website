import { createContext, useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import EditorComponent from "../components/blog-editor.component";
import PublishFormComponent from "../components/publish-form.component";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext(blogStructure);

const EditorPage = () => {
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  return (
    <EditorContext.Provider
      value={{ blog, setBlog, editorState, setEditorState }}
    >
      {access_token === null ? (
        <Navigate to="/signin" />
      ) : editorState == "editor" ? (
        <EditorComponent />
      ) : (
        <PublishFormComponent />
      )}
    </EditorContext.Provider>
  );
};

export default EditorPage;
