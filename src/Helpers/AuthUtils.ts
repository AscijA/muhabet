import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  AuthError,
  AuthErrorCodes,
  User as FirebaseUser,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { userSetUp } from "./UserUtils";
import { setCurrentChat, setShowDefaultImage } from "src/store/chatSlice";
import { getContactImage, getImageFromFirebaseAndSaveToIDB } from "./idb";
import { updateUser } from "src/store/userSlice";
import { subscribeToChats } from "src/subscriptions/subscribeToChats";
import { AppDispatch } from "src/store/store";
import { UserState } from "src/store/userSlice";

export const subscribeToAuthChangesOnChatLoad = (
  dispatch: AppDispatch,
  setLoading: (loading: boolean) => void,
  navigate?: (path: string) => void
) => {
  let unsubChats: (() => void) | null = null;

  const unsubAuth = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      await userSetUp(user, dispatch);

      try {
        const image = await getContactImage(user.uid);
        if (image) {
          dispatch(updateUser({ profilePic: URL.createObjectURL(image) }));
          dispatch(setShowDefaultImage(false));
        }
      } catch (e) {
        // ignore
      }

      try {
        if (auth.currentUser) {
          const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
          const url = await getDownloadURL(gsRef);
          dispatch(updateUser({ profilePic: url }));
          dispatch(setShowDefaultImage(false));
          await getImageFromFirebaseAndSaveToIDB(user.uid, url);
        }
      } catch (error) {
      }

      if (unsubChats) {
        unsubChats();
        unsubChats = null;
      }
      unsubChats = subscribeToChats(user.uid, dispatch, () => setLoading(false));
    } else {
      if (unsubChats) {
        unsubChats();
        unsubChats = null;
      }
      setLoading(false);
      dispatch(setCurrentChat({
        chatId: "",
        lastSeen: "",
        contact: { profilePic: "", email: "", uid: "" },
        messages: [],
      }));
      if (navigate) navigate("/");
    }
  });

  return () => {
    try { unsubChats?.(); } catch { }
    try { unsubAuth?.(); } catch { }
  };
};

export const subscribeToAuthChangesOnLogin = (dispatch: AppDispatch, navigate: (path: string) => void) => {
  return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      userSetUp(user, dispatch).then(() => navigate("/chat"));
    } else {
      dispatch(setCurrentChat({
        chatId: "",
        lastSeen: "",
        contact: { profilePic: "", email: "", uid: "" },
        messages: [],
      }));
    }
  });
};

export const signUpUser = async (
  email: string,
  password: string,
  setErrorMessage: (msg: string) => void,
  setShowError: (show: boolean) => void
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userInfo = userCredential.user;

    const user: Partial<UserState> = {
      email: userInfo.email || "",
      displayName: userInfo.displayName || "",
      emailVerified: userInfo.emailVerified,
      createdAt: userInfo.metadata.creationTime,
      uid: userInfo.uid,
    };

    await setDoc(doc(db, "users", userInfo.uid), user);
  } catch (error) {
    handleAuthError(error as AuthError, setErrorMessage, setShowError);
  }
};

export const signInUser = async (
  email: string,
  password: string,
  dispatch: AppDispatch,
  navigate: (path: string) => void,
  setErrorMessage: (msg: string) => void,
  setShowError: (show: boolean) => void
) => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    if (auth.currentUser) {
      await userSetUp(auth.currentUser, dispatch);
    }
    navigate("/chat");
  } catch (error) {
    setShowError(true);
    setErrorMessage("Invalid Credentials");
  }
};

export const resetUserPassword = async (
  email: string,
  setShowResetModal: (show: boolean) => void,
  setErrorMessage: (msg: string) => void,
  setShowError: (show: boolean) => void
) => {
  try {
    await sendPasswordResetEmail(auth, email);
    setShowResetModal(false);
  } catch (error) {
    handleAuthError(error as AuthError, setErrorMessage, setShowError);
  }
};

const handleAuthError = (
  error: AuthError,
  setErrorMessage: (msg: string) => void,
  setShowError: (show: boolean) => void
) => {
  switch (error.code) {
    case AuthErrorCodes.WEAK_PASSWORD:
      setErrorMessage("Password has to be at least 6 characters long");
      break;
    case AuthErrorCodes.INVALID_EMAIL:
      setErrorMessage("Email is invalid");
      break;
    case AuthErrorCodes.EMAIL_EXISTS:
      setErrorMessage("Email is already in use");
      break;
    case AuthErrorCodes.USER_DELETED:
      setErrorMessage("Email/User not found");
      break;
    default:
      setErrorMessage("An Error Occurred");
      break;
  }
  setShowError(true);
};

export const subscribeToAuthChangesBasic = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
