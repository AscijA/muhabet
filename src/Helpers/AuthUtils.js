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


/**
 * Subscribes to authentication state changes when the chat loads.
 *
 * @param {*} dispatch 
 * @param {*} setLoading
 * @return {*} 
 */
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

/**
 * Subscribes to authentication state changes when the user logs in.
 *
 * @param {*} dispatch
 * @param {*} navigate
 * @return {*} 
 */
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

/**
 * Signs up a new user with email and password.
 *
 * @param {*} email Email of the user
 * @param {*} password Password for the user
 * @param {*} setErrorMessage Function to set error message
 * @param {*} setShowError Function to show error message
 */
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

/**
 * Signs in an existing user with email and password.
 *
 * @param {*} email Email of the user
 * @param {*} password Password for the user
 * @param {*} dispatch Dispatch function to update the store
 * @param {*} navigate Function to navigate after login
 * @param {*} setErrorMessage Function to set error message
 * @param {*} setShowError Function to show error message
 */
const signInUser = async (email, password, dispatch, navigate, setErrorMessage, setShowError) => {
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

/**
 * Resets the user's password by sending a password reset email.
 *
 * @param {*} email Email of the user
 * @param {*} setShowResetModal Function to show/hide the reset modal
 * @param {*} setErrorMessage Function to set error message
 * @param {*} setShowError Function to show error message
 */
const resetUserPassword = async (email, setShowResetModal, setErrorMessage, setShowError) => {
  try {
    await sendPasswordResetEmail(auth, email);
    setShowResetModal(false);
  } catch (error) {
    handleAuthError(error, setErrorMessage, setShowError);
  }
};

/**
 * Handles authentication errors and sets appropriate error messages.
 *
 * @param {*} error Error object from Firebase
 * @param {*} setErrorMessage Function to set error message
 * @param {*} setShowError Function to show error message
 */
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

/**
 * Subscribes to authentication state changes with a basic callback.
 *
 * @param {*} callback Callback function to handle auth state changes
 * @return {*} 
 */
const subscribeToAuthChangesBasic = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { subscribeToAuthChangesOnLogin, signUpUser, signInUser, resetUserPassword, subscribeToAuthChangesBasic, subscribeToAuthChangesOnChatLoad };
