import { Outlet } from "react-router-dom";

const SideNavbar = () => {
    return (
        <>
            <h1>SideNavbar</h1>

            <Outlet />
        </>
    )
}

export default SideNavbar;