import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  AuthErrorCodes
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db,storage } from "../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { userSetUp } from "./UserUtils";
import { fetchChats } from "./ChatUtils";
import { setCurrentChat, setShowDefaultImage } from "src/store/chatSlice";
import { getContactImage, getImageFromFirebaseAndSaveToIDB } from "./idb";
import { updateUser } from "src/store/userSlice";

const subscribeToAuthChangesOnChatLoad = (dispatch, setLoading) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await userSetUp(user, dispatch);
      
      try {
        const image = await getContactImage(user.uid);
        if (image) {
          dispatch(updateUser({ profilePic: URL.createObjectURL(image) }));
          dispatch(setShowDefaultImage(false));
        }
        
        const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
        const url = await getDownloadURL(gsRef);
        
        dispatch(updateUser({ profilePic: url }));
        dispatch(setShowDefaultImage(false));
        await getImageFromFirebaseAndSaveToIDB(user.uid, url);
      } catch (error) {
        console.error("Error fetching user profile pic:", error);
      }
      
      try {
        await fetchChats(user.uid, dispatch);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
  });
};

const subscribeToAuthChangesOnLogin = (dispatch, navigate) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      userSetUp(user, dispatch)
        .then(() => fetchChats(user.uid, dispatch))
        .then(() => navigate("/chat"));
    } else {
      dispatch(setCurrentChat({
        chatId: "",
        lastSeen: "",
        contact: { profilePic: "", email: "", uid: "" },
        messages: [],
        chatStatus: {}
      }));
    }
  });
};

const signUpUser = async (email, password, setErrorMessage, setShowError) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userInfo = userCredential.user;

    const user = {
      email: userInfo.email,
      displayName: userInfo.displayName,
      emailVerified: userInfo.emailVerified,
      createdAt: userInfo.metadata.creationTime,
      uid: userInfo.uid,
    };

    await addDoc(collection(db, "users"), user);
  } catch (error) {
    handleAuthError(error, setErrorMessage, setShowError);
  }
};

const signInUser = async (email, password, dispatch, navigate, setErrorMessage, setShowError, userSetUp) => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    await userSetUp(auth.currentUser, dispatch);
    navigate("/chat");
  } catch (error) {
    setShowError(true);
    setErrorMessage("Invalid Credentials");
  }
};

const resetUserPassword = async (email, setShowResetModal, setErrorMessage, setShowError) => {
  try {
    await sendPasswordResetEmail(auth, email);
    setShowResetModal(false);
  } catch (error) {
    handleAuthError(error, setErrorMessage, setShowError);
  }
};

const handleAuthError = (error, setErrorMessage, setShowError) => {
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

const subscribeToAuthChangesBasic = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { subscribeToAuthChangesOnLogin, signUpUser, signInUser, resetUserPassword, subscribeToAuthChangesBasic, subscribeToAuthChangesOnChatLoad };
