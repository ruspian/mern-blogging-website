import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { toast, Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const ChangePasswordPage = () => {

    let {
        userAuth: { access_token },
    } = useContext(UserContext);


    let changePasswordForm = useRef();

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const handleSubmit = (event) => {
        event.preventDefault();

        let form = new FormData(changePasswordForm.current);
        let formData = {};

        // loop data dari form
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        // mengambil data inputan user dan menaruhnya di variabel formData
        let { passwordSaatIni, passwordBaru } = formData;

        // validasi jika form kosong
        if (!passwordSaatIni.length || !passwordBaru.length) {
            return toast.error("Mohon isi form ubah password!");
        }

        // validasi jika password tidak sesuai regex
        if (!passwordRegex.test(passwordSaatIni) || !passwordRegex.test(passwordBaru)) {
            return toast.error("Password Harus Minimal 6 - 20 Karakter! Dengan Huruf Besar, Huruf Kecil, dan Angka!");
        }

        // buat tombol ubah password hanya bisa di klik satu kali
        event.target.setAttribute("disabled", true);

        let loadingToast = toast.loading("Sedang mengubah password...");

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/ubah-password", formData, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
            .then(() => {
                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                toast.success("Password Berhasil Diubah!");
            })
            .catch(({ response }) => {
                toast.dismiss(loadingToast);
                event.target.removeAttribute("disabled");
                toast.error(response.data.error);
            })


    }


    return (

        <AnimationWrapper >
            <Toaster />
            <form ref={changePasswordForm} action="">
                <h1 className="max-md:hidden">Ubah Password</h1>

                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox
                        name="passwordSaatIni"
                        type="password"
                        className="profile-edit-input"
                        placeholder="Password Saat Ini"
                        icon="fi-rr-unlock"
                    />

                    <InputBox
                        name="passwordBaru"
                        type="password"
                        className="profile-edit-input"
                        placeholder="Password Baru"
                        icon="fi-rr-unlock"
                    />

                    <button
                        onClick={handleSubmit}
                        className="btn-dark px-10 mt-5"
                        type="submit"
                    >
                        Ubah Password
                    </button>
                </div>
            </form>
        </AnimationWrapper>
    )
}

export default ChangePasswordPage;