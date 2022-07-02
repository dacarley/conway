// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { Firestore, getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCsAV_hArEC3vNm1K6imOO9kZ77yQdTJwE",
    authDomain: "conway-37954.firebaseapp.com",
    projectId: "conway-37954",
    storageBucket: "conway-37954.appspot.com",
    messagingSenderId: "684092946686",
    appId: "1:684092946686:web:31051475ad64b4b6824daf",
    measurementId: "G-K1ELPC11MN"
};

let app: FirebaseApp;
let db: Firestore;

export function init() {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
}

export async function getItem(key: string) {
    const docRef = doc(db, "stuff", key);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error("No such document!");
    }

    return docSnap.data();
}

export async function setItem(key: string, value: Record<string, any>) {
    await setDoc(doc(db, "stuff", key), value);
}

export async function removeItem(key: string) {
    await deleteDoc(doc(db, "stuff", key));
}
