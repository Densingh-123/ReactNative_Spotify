import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD15DMDI6KFTC2ZSoCiqHDw-BSubUWvgEA",
  authDomain: "tunes-bb922.firebaseapp.com",
  projectId: "tunes-bb922",
  storageBucket: "tunes-bb922.firebasestorage.app",
  messagingSenderId: "429435824070",
  appId: "1:429435824070:web:8bb3afbdc7d1169b3934c7",
  measurementId: "G-B94F5Q6VBG",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage for persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const ENV = {
  VITE_SAAVN_API_BASE: "https://www.jiosaavn.com/api.php",
  VITE_SAAVN_DES_KEY: "38346591",
  VITE_PIPED_API_BASE: "https://pipedapi.kavin.rocks",
  VITE_LRCLIB_API_BASE: "https://lrclib.net/api",
  VITE_CORS_PROXY: "https://api.codetabs.com/v1/proxy/?quest="
};

export default app;
