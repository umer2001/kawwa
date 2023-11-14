import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "kawwa-380914.firebaseapp.com",
    projectId: "kawwa-380914",
    storageBucket: "kawwa-380914.appspot.com",
    messagingSenderId: "1072712612386",
    appId: "***REMOVED***"
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);