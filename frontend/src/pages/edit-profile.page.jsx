import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";

const EditProfilPage = () => {

    let { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext);

    let bioLimit = 150;

    let profilImgElement = useRef();
    let editProfilForm = useRef();

    const [profil, setProfil] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [characterLeft, setCharacterLeft] = useState(bioLimit);
    const [updateImgProfil, setUpdateImgProfil] = useState(null);

    let { personal_info: { fullname, username: profile_username, profile_img, email, bio }, social_links } = profil;


    useEffect(() => {

        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/profil", { username: userAuth.username })
                .then(({ data }) => {
                    // console.log(data);

                    setProfil(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                })
        }

    }, [access_token]);

    const handleCharacterChange = (event) => {
        setCharacterLeft(bioLimit - event.target.value.length);
    }

    const handleImgPreview = (event) => {

        let img = event.target.files[0];

        profilImgElement.current.src = URL.createObjectURL(img);

        setUpdateImgProfil(img);
    }

    const handleUploadImg = async (event) => {

        event.preventDefault();

        if (!updateImgProfil) {
            toast.error("Pilih gambar terlebih dahulu!");
            return;
        }

        const toastLoading = toast.loading("Mengunggah gambar...");

        // Buat formData untuk mengirim file
        const formData = new FormData();
        formData.append("image", updateImgProfil);

        try {
            // Kirim file ke server
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/profil-image-url`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const { filePath } = response.data;
            const fullPath = import.meta.env.VITE_SERVER_DOMAIN + filePath;

            // Perbarui URL gambar di database pengguna
            await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/change-image-profil`,
                { url: fullPath },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );

            let newUserAuth = { ...userAuth, profile_img: fullPath };
            storeInSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);

            setUpdateImgProfil(null);

            toast.dismiss(toastLoading);
            event.target.removeAttribute("disabled");
            toast.success("Gambar berhasil diunggah!");
        } catch (error) {
            toast.dismiss(toastLoading);
            event.target.removeAttribute("disabled");
            toast.error("Gagal mengunggah gambar!");
        }

    }

    const handleSubmit = (event) => {
        event.preventDefault();

        let form = new FormData(editProfilForm.current);
        let formData = {};

        // loop data dari form
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { username, bio, youtube, instagram, facebook, twitter, github, website } = formData;

        const bioLimit = 150;

        if (username.length < 3) {
            return toast.error("Username minimal 3 karakter!");
        }

        if (bio.length > bioLimit) {
            return toast.error("Bio maksimal 150 karakter!");
        }

        let loadingToast = toast.loading("Mengubah profil...");
        event.target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profil",
            {
                username, bio,
                social_links: {
                    youtube, instagram, facebook, twitter, github, website
                }
            }, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
            .then(({ data }) => {
                if (data.username && userAuth.username !== data.username) {
                    let newUserAuth = { ...userAuth, username: data.username };
                    storeInSession("user", JSON.stringify(newUserAuth));
                    setUserAuth(newUserAuth);
                }

                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                toast.success("Profil berhasil diubah!");
            })
            .catch(({ response }) => {
                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                toast.error(response?.data?.error);
            })
    }

    return (

        <AnimationWrapper>
            {
                loading ? <Loader />
                    :
                    <form ref={editProfilForm}>
                        <Toaster />

                        <h1 className="max-md:hidden">Edit Profil</h1>

                        <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                            <div className="max-lg:center mb-5">
                                <label htmlFor="uploadImg" id="profilImgLabel" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                                    <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                                        Unggah Gambar
                                    </div>
                                    <img ref={profilImgElement} className="" src={profile_img} alt="" />
                                </label>
                                <input type="file" id="uploadImg" accept=".jpg, .png, .jpeg" hidden onChange={handleImgPreview} />

                                <button className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleUploadImg}>Unggah</button>
                            </div>

                            <div className="w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">

                                    <div className="">
                                        <InputBox name="fullname" type="text" value={fullname} placeholder="Nama Lengkap" disable={true} icon="fi-br-user-pen" />
                                    </div>

                                    <div className="">
                                        <InputBox name="email" type="text" value={email} placeholder="Email" disable={true} icon="fi-br-envelope" />
                                    </div>
                                </div>

                                <InputBox type="text" name="username" value={profile_username} placeholder="Username" icon="fi-br-at" />

                                <p className="text-dark-grey -mt-3 text-sm">User lain dapat mencari anda dengan username anda</p>

                                <textarea name="bio" maxLength={bioLimit} defaultValue={bio} className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" placeholder="Tuliskan tentang diri anda!" onChange={handleCharacterChange}></textarea>

                                <p className="mt-1 text-sm text-dark-grey">{characterLeft} karakter</p>

                                <p className="my-6 text-dark-grey">Tambahkan Sosial Media Anda</p>

                                <div className="md:grid md:grid-cols-2 gap-x-6">
                                    {
                                        Object.keys(social_links).map((key, index) => {
                                            let link = social_links[key];

                                            return <InputBox key={index} name={key} type="text" value={link} placeholder={`Tambah ${key}`} icon={key !== "website" ? "fi-brands-" + key : "fi-rr-globe"} />
                                        })
                                    }
                                </div>

                                <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>Update</button>
                            </div>
                        </div>
                    </form>
            }
        </AnimationWrapper>
    )
}

export default EditProfilPage;