import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import info from '../info.json';
const firebaseConfig = {
    apiKey: info.apiKey,
    authDomain: info.authDomain,
    projectId: info.projectId,
    storageBucket: info.storageBucket,
    messagingSenderId: info.messagingSenderId,
    appId: info.appId,
    databaseURL: info.databaseURL
};
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
