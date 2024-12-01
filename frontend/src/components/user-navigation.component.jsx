import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);

  //   fungsi untuk logout
  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
  };

  return (
    <AnimationWrapper
      transition={{ duration: 0.2 }}
      className="absolute right-0 z-50"
    >
      {/* edit */}
      <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
        <Link to="/editor" className="flex gap-2 md:hidden pl-8 py-4">
          <i className="fi fi-sr-file-edit"></i>
          <p>Buat Blog</p>
        </Link>

        {/* profile */}
        <Link to={`/user/${username}`} className="link pl-8 py-4">
          Profil
        </Link>

        {/* dasboard */}
        <Link to="/dashboard/blog" className="link pl-8 py-4">
          Dashboard
        </Link>

        {/* setting edit profil*/}
        <Link to="/setting/edit-profile" className="link pl-8 py-4">
          Pengaturan
        </Link>

        <span className="abbsolute border-t border-grey w-[100%]"></span>

        <button
          className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
          onClick={signOutUser}
        >
          <h1 className="font-bold text-xl mg-1">Keluar</h1>
          <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
