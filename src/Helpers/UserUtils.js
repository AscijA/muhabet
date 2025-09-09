import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { auth, storage } from '../Firebase/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import { setUser } from "src/store/userSlice";
import { db } from "src/Firebase/firebase";
import { deleteUser } from 'firebase/auth';

/**
 * Set up user object
 * @param {Object} authUser - Firebase auth user object
 * @param {Function} dispatch - Redux dispatch
 */
const userSetUp = async (authUser, dispatch) => {
  const user = {
    email: authUser.email,
    displayName: authUser.displayName,
    emailVerified: authUser.emailVerified,
    createdAt: authUser.metadata.creationTime,
    uid: authUser.uid,
  };
  dispatch(setUser({ ...user }));
};

/**
 * Get user profile image from Firebase Storage
 */
const getUserProfileImage = async (dispatch, updateUser, setShowDefaultImage) => {
  try {
    const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    const url = await getDownloadURL(gsRef);
    dispatch(updateUser({ profilePic: url }));
    dispatch(setShowDefaultImage(false));
  } catch (error) {
    dispatch(setShowDefaultImage(true));
  }
};

/**
 * Upload user profile image to Firebase Storage
 */
const uploadProfileImage = async (file, dispatch, updateUser, setShowDefaultImage) => {
  try {
    const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    dispatch(updateUser({ profilePic: url }));
    dispatch(setShowDefaultImage(false));
  } catch (error) {
    console.error("Error uploading profile image:", error);
  }
};

/**
 * Remove user profile image from Firebase Storage
 */
const removeUserProfileImage = async (dispatch, updateUser, setShowDefaultImage) => {
  try {
    const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    await deleteObject(storageRef);
    dispatch(updateUser({ profilePic: "" }));
    dispatch(setShowDefaultImage(true));
  } catch (error) {
    console.error("Error deleting profile image:", error);
  }
};

/**
 * Sign out user and reset state
 */
const signOutUser = async (dispatch, resetUser, resetChatState, navigate) => {
  try {
    await auth.signOut();
    dispatch(resetUser());
    dispatch(resetChatState());
    navigate("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

/**
 * Delete user account from Firebase
 */
const deleteUserAccount = async (dispatch, resetUser, navigate) => {
  try {
    await deleteUser(auth.currentUser);
    dispatch(resetUser());
    navigate("/");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const getUidFromEmail = async (email) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().uid;
};

export {
  userSetUp,
  getUserProfileImage,
  uploadProfileImage,
  removeUserProfileImage,
  signOutUser,
  deleteUserAccount,
};
