import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import logo from "../imgs/logo.png";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";

const Navbar = () => {
  const [boxPencarian, setBoxPencarian] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);

  const navigate = useNavigate();

  const {
    userAuth,
    userAuth: { access_token, profile_img, notifikasi_baru }, setUserAuth
  } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/notifikasi-baru", { headers: { Authorization: `Bearer ${access_token}` } })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch(err => {
          console.log(err);
        })
    }
  }, [access_token]);

  // fungsi untuk handle user nav panel
  const handleUserNavPanel = () => {
    setUserNavPanel(!userNavPanel);
  };

  // fungsi untuk handle pencarian
  const handleSearch = (event) => {
    let query = event.target.value;

    if (event.keyCode === 13 && query.length) {
      navigate(`/cari/${query}`);
    }
  };

  // fungsi untuk handle blur
  const handleBlur = () => {
    setTimeout(() => {
      setBoxPencarian(false);
    }, 200);
  };

  return (
    <>
      {/* logo */}
      <nav className="navbar z-50">
        <Link to="/" className="flex-none w-10">
          <img src={logo} className="w-full" />
        </Link>



        {/* form pencarian */}
        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (boxPencarian ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="Cari..."
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full claceholder:text-dark-grey md:pl-12"
            onKeyDown={handleSearch}
          />
          <i className="fi fi-br-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>

        {/* tombol pencarian */}
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setBoxPencarian(!boxPencarian)}
          >
            <i className="fi fi-br-search text-xl"></i>
          </button>

          {/* tombol buat artikel */}
          <Link to="/editor" className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-edit-alt"></i>
            <p>Buat Artikel</p>
          </Link>

          {access_token ? (
            <>
              {/* tombol notifikasi */}
              <Link to="/dashboard/notification">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-xl clock mt-1"></i>
                  {
                    notifikasi_baru ?
                      <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-3"></span>
                      :
                      ""
                  }
                </button>
              </Link>

              {/* tombol profile */}
              <div
                className="relative"
                onClick={handleUserNavPanel}
                onBlur={handleBlur}
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    src={profile_img}
                    className="w-full h-full object-cover rounded-full "
                  />
                </button>

                {userNavPanel ? <UserNavigationPanel /> : ""}
              </div>
            </>
          ) : (
            <>
              {/* tombol masuk */}
              <Link className="btn-dark py-2" to="/signin">
                Masuk
              </Link>

              {/* tombol daftar */}
              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
