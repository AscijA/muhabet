import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { firebaseApp } from "./firebaseApp";

export const auth = getAuth(firebaseApp);
export const cloudFunctions = getFunctions(firebaseApp);
