import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import EditorPage from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilPage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNavbar from "./components/sidenavbar.component";
import ChangePasswordPage from "./pages/change-password.page";
import EditProfilPage from "./pages/edit-profile.page";

// membuat global context untuk mengelolah data
export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");

    // set data user dan simpan dalam session
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="editor/:blog_id" element={<EditorPage />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="setting" element={<SideNavbar />}>
            <Route path="edit-profile" element={<EditProfilPage />} />
            <Route path="ubah-password" element={<ChangePasswordPage />} />
          </Route>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="cari/:query" element={<SearchPage />} />
          <Route path="user/:id" element={<ProfilPage />} />
          <Route path="blog/:blog_id" element={<BlogPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
