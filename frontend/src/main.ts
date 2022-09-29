import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6ETL9QMZR7VeNodRdc1q5X662iDz8CaE",
  authDomain: "case-openings.firebaseapp.com",
  projectId: "case-openings",
  storageBucket: "case-openings.appspot.com",
  messagingSenderId: "502306099010",
  appId: "1:502306099010:web:a96054b3f179d4ef0742db",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

createApp(App).use(router).mount("#app");
