// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCo1aKPlV6KfG9RHkMQGOs3di8Zvfm33_c",
  authDomain: "likelion-realtalk.firebaseapp.com",
  projectId: "likelion-realtalk",
  storageBucket: "likelion-realtalk.firebasestorage.app",
  messagingSenderId: "472221124254",
  appId: "1:472221124254:web:49c988def1310b8b309d8f",
  measurementId: "G-EFZFH8NTQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (브라우저에서만)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
