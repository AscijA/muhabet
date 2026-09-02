import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  AuthErrorCodes
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { userSetUp } from "./UserUtils";
import { setCurrentChat, setShowDefaultImage } from "src/store/chatSlice";
import { getContactImage, getImageFromFirebaseAndSaveToIDB } from "./idb";
import { updateUser } from "src/store/userSlice";
import { subscribeToChats } from "src/subscriptions/subscribeToChats";

/**
 * Subscribes to authentication state changes when the chat loads.
 * - Populates user
 * - Loads profile image (IDB -> Storage)
 * - Starts realtime chat subscription
 * - Calls setLoading(false) after the FIRST chat snapshot arrives (or on error)
 *
 * @param {Function} dispatch
 * @param {Function} setLoading
 * @return {Function} unsubscribe
 */
const subscribeToAuthChangesOnChatLoad = (dispatch, setLoading, navigate) => {
  let unsubChats = null;

  const unsubAuth = onAuthStateChanged(auth, async (user) => {
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
        const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
        const url = await getDownloadURL(gsRef);
        dispatch(updateUser({ profilePic: url }));
        dispatch(setShowDefaultImage(false));
        await getImageFromFirebaseAndSaveToIDB(user.uid, url);
      } catch (error) {
      }

      // Start realtime chat subscription; mark loading false on first snapshot
      if (unsubChats) {
        unsubChats();
        unsubChats = null;
      }
      unsubChats = subscribeToChats(user.uid, dispatch, () => setLoading(false));
    } else {
      // Signed out: stop chat stream and reset loading
      if (unsubChats) {
        unsubChats();
        unsubChats = null;
      }
      setLoading(false);
      // Optionally clear current chat UI
      dispatch(setCurrentChat({
        chatId: "",
        lastSeen: "",
        contact: { profilePic: "", email: "", uid: "" },
        messages: [],
      }));
      // Redirect to login
      if (navigate) navigate("/");
    }
  });

  // Return a single unsubscribe that cleans up both listeners
  return () => {
    try { unsubChats?.(); } catch { }
    try { unsubAuth?.(); } catch { }
  };
};

/**
 * Subscribes to authentication state changes when the user logs in (pre-chat screens).
 * After sign-in, we navigate to /chat; the Chat page will start the realtime subscription.
 *
 * @param {Function} dispatch
 * @param {Function} navigate
 * @return {Function} unsubscribe
 */
const subscribeToAuthChangesOnLogin = (dispatch, navigate) => {
  return onAuthStateChanged(auth, (user) => {
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

/**
 * Signs up a new user with email and password.
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

    await setDoc(doc(db, "users", userInfo.uid), user);
  } catch (error) {
    handleAuthError(error, setErrorMessage, setShowError);
  }
};

/**
 * Signs in an existing user with email and password.
 * Navigation to /chat triggers Chat screen which starts the realtime subscription.
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
 */
const subscribeToAuthChangesBasic = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export {
  subscribeToAuthChangesOnLogin,
  signUpUser,
  signInUser,
  resetUserPassword,
  subscribeToAuthChangesBasic,
  subscribeToAuthChangesOnChatLoad
};
