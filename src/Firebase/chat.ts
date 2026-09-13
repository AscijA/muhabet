import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { cloudFunctions } from "./auth";
import { firebaseApp } from "./firebaseApp";

export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export { cloudFunctions };
