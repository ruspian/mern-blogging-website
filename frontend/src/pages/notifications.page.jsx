import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessageComponent from "../components/nodata.component";
import NotificationCardComponent from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const NotificationPage = () => {

  let { userAuth, userAuth: { access_token, notifikasi_baru }, setUserAuth } = useContext(UserContext);

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

  let filters = ["all", "like", "comment", "reply"];


  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifikasi",
      { page, filter, deletedDocCount },
      { headers: { Authorization: `Bearer ${access_token}` } })
      .then(async ({ data: { notifications: data } }) => {

        if (notifikasi_baru) {
          setUserAuth({ ...userAuth, notifikasi_baru: false });
        }

        let formatedData = await filterPaginationData({
          state: notifications,
          data, page,
          countRoute: "/semua-notifikasi",
          data_to_send: { filter },
          user: access_token
        })

        setNotifications(formatedData);

      })
      .catch(err => {
        console.log(err);
      })
  }

  useEffect(() => {

    if (access_token) {
      fetchNotifications({ page: 1 });
    }

  }, [access_token, filter]);

  const handleBtnFilter = (event) => {

    let btn = event.target;

    setFilter(btn.innerHTML);

    setNotifications(null);

  }



  return (
    <div className="">
      <h1 className="max-md:hidden">Notifikasi Terkini!</h1>

      <div className="my-8 flex gap-6">
        {
          filters.map((filterName, index) => {
            return <button key={index} className={"text-sm py-2 " + (filter === filterName ? "btn-dark" : "btn-light")} onClick={handleBtnFilter}>{filterName}</button>
          })
        }
      </div>

      {
        notifications === null ? <Loader />
          :
          <>
            {
              notifications.result.length ? notifications.result.map((notification, index) => {
                return (
                  <AnimationWrapper key={index} transition={{ delay: index * 0.08 }}>
                    <NotificationCardComponent data={notification} index={index} notificationState={{ notifications, setNotifications }} />
                  </AnimationWrapper>
                )
              })
                :
                <NoDataMessageComponent message="Tidak ada notifikasi." />
            }

            <LoadMoreDataBtn
              state={notifications}
              fetchDataFun={fetchNotifications}
              additionalParam={{ deletedDocCount: notifications.deletedDocCount }}
            />
          </>
      }
    </div>
  )
}

export default NotificationPage;