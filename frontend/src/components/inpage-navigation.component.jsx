import { useEffect, useRef, useState } from "react";

export let activeTabLineRef;
export let activeTab;

const InPageNavigation = ({
  routes,
  dafaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  activeTabLineRef = useRef();
  activeTab = useRef();

  let [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

  //   fungsi untuk merubah state inpage nav saat tombol di klik
  const changePageState = (btn, index) => {
    let { offsetLeft, offsetWidth } = btn;

    // menambahkan style untuk active tab
    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";

    // merubah active state inpage nav
    setInPageNavIndex(index);
  };

  //   hook useEffect untuk merubah state inpage nav
  useEffect(() => {
    changePageState(activeTab.current, defaultActiveIndex);
  }, []);

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {/* tombol navigasi inpage */}
        {routes.map((route, index) => {
          return (
            <button
              className={
                "p-4 px-5 capitalize " +
                (inPageNavIndex === index
                  ? "text-black "
                  : "text-dark-grey " + dafaultHidden.includes(route)
                  ? " md:hidden "
                  : "")
              }
              key={index}
              ref={defaultActiveIndex === index ? activeTab : null}
              onClick={(event) => changePageState(event.target, index)}
            >
              {route}
            </button>
          );
        })}

        {/* line navigasi inpage */}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>

      {/* konten blog */}
      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
