import { useContext, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { UserContext } from "../App";

const SideNavbar = () => {

    let { userAuth: { access_token } } = useContext(UserContext);

    let page = location.pathname.split("/")[2];

    let [pageState, setPageState] = useState(page.replace("-", " "));
    let [showHideNav, setShowHideNav] = useState(false);

    let activeTabLine = useRef();
    let sidebarIconTab = useRef();
    let pageStateTab = useRef();

    const changePagestate = (event) => {

        let { offsetWidth, offsetLeft } = event.target;

        activeTabLine.current.style.width = `${offsetWidth}px`;
        activeTabLine.current.style.left = `${offsetLeft}px`;

        if (event.target === sidebarIconTab.current) {
            setShowHideNav(true);
        } else {
            setShowHideNav(false);
        }

    }

    useEffect(() => {
        setShowHideNav(false);
        pageStateTab.current.click();
    }, [pageState]);




    return (

        access_token === null ? <Navigate to="/signin" />
            :
            <>
                <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
                    <div className="sticky top-[80px] z-30">

                        <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto ">
                            <button onClick={changePagestate} ref={sidebarIconTab} className="p-5 capitalize">
                                <i className="fi fi-sr-chart-simple-horizontal pointer-events-none"></i>
                            </button>

                            <button onClick={changePagestate} ref={pageStateTab} className="p-5 capitalize">
                                {pageState}
                            </button>
                            <hr ref={activeTabLine} className="absolute bottom-0 duration-500" />
                        </div>

                        <div
                            className={"min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 " + (!showHideNav ? "max-md:opacity-0 max-md:pointer-events-none" : "opacity-100 pointer-events-auto")}
                        >
                            <h1 className="text-xl text-dark-grey mb-3">DashBoard</h1>
                            <hr className="border-grey -ml-6 mb-8 mr-6" />

                            <NavLink
                                to="/dashboard/blog"
                                onClick={(event) => setPageState(event.target.innerText)}
                                className="sidebar-link"
                            >
                                <i className="fi fi-rr-blog-text"></i>
                                Blog
                            </NavLink>

                            <NavLink
                                to="/dashboard/notifikasi"
                                onClick={(event) => setPageState(event.target.innerText)}
                                className="sidebar-link"
                            >
                                <i className="fi fi-bs-bells"></i>
                                Notifikasi

                            </NavLink>

                            <NavLink
                                to="/editor"
                                onClick={(event) => setPageState(event.target.innerText)}
                                className="sidebar-link"
                            >
                                <i className="fi fi-br-feather"></i>
                                Buat Blog
                            </NavLink>

                            <h1 className="text-xl text-dark-grey mt-20 mb-3">Pengaturan</h1>
                            <hr className="border-grey -ml-6 mb-8 mr-6" />

                            <NavLink
                                to="/setting/edit-profile"
                                onClick={(event) => setPageState(event.target.innerText)}
                                className="sidebar-link"
                            >
                                <i className="fi fi-br-user-gear"></i>
                                Edit Profil
                            </NavLink>

                            <NavLink
                                to="/setting/ubah-password"
                                onClick={(event) => setPageState(event.target.innerText)}
                                className="sidebar-link"
                            >
                                <i className="fi fi-bs-key"></i>
                                Ubah Password
                            </NavLink>
                        </div>
                    </div>


                    <div className="max-md:-mt-8 mt-5 w-full ">
                        <Outlet />
                    </div>
                </section>
            </>
    )
}

export default SideNavbar;