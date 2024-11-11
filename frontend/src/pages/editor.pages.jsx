import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import EditorComponent from "../components/blog-editor.component";
import PublishFormComponent from "../components/publish-form.component";

const EditorPage = () => {
  const [editorState, setEditorState] = useState("editor");

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  return access_token === null ? (
    <Navigate to="/signin" />
  ) : editorState == "editor" ? (
    <EditorComponent />
  ) : (
    <PublishFormComponent />
  );
};

export default EditorPage;
