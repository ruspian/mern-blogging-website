// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCj30A324OMWDiyJOjMY04-FxqLfq27cd0",
  authDomain: "blog-web-reactjs.firebaseapp.com",
  projectId: "blog-web-reactjs",
  storageBucket: "blog-web-reactjs.firebasestorage.app",
  messagingSenderId: "777625090296",
  appId: "1:777625090296:web:6fb0bd03b4537697be230d",
  measurementId: "G-T0PPPCM4SH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// google auth
const provider = new GoogleAuthProvider();

const auth = getAuth();
export const authWithGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((error) => {
      console.log(error);
    });
  return user;
};
