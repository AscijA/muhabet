import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { auth, storage } from '../Firebase/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import { setUser, UserState } from "src/store/userSlice";
import { db } from "src/Firebase/firebase";
import { deleteUser, User as FirebaseUser } from 'firebase/auth';
import { AppDispatch } from "src/store/store";
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

export const userSetUp = async (authUser: FirebaseUser, dispatch: AppDispatch) => {
  const user: UserState = {
    email: authUser.email || "",
    displayName: authUser.displayName || "",
    emailVerified: authUser.emailVerified,
    createdAt: authUser.metadata.creationTime || "",
    uid: authUser.uid,
    contacts: [],
    profilePic: "",
    settings: null
  };
  dispatch(setUser(user));
};

export const getUserProfileImage = async (
  dispatch: AppDispatch,
  updateUserAction: ActionCreatorWithPayload<Partial<UserState>>,
  setShowDefaultImageAction: ActionCreatorWithPayload<boolean>
) => {
  try {
    if (auth.currentUser) {
      const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
      const url = await getDownloadURL(gsRef);
      dispatch(updateUserAction({ profilePic: url }));
      dispatch(setShowDefaultImageAction(false));
    }
  } catch (error) {
    dispatch(setShowDefaultImageAction(true));
  }
};

export const uploadProfileImage = async (
  file: File,
  dispatch: AppDispatch,
  updateUserAction: ActionCreatorWithPayload<Partial<UserState>>,
  setShowDefaultImageAction: ActionCreatorWithPayload<boolean>
) => {
  try {
    if (auth.currentUser) {
      const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      dispatch(updateUserAction({ profilePic: url }));
      dispatch(setShowDefaultImageAction(false));
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
  }
};

export const removeUserProfileImage = async (
  dispatch: AppDispatch,
  updateUserAction: ActionCreatorWithPayload<Partial<UserState>>,
  setShowDefaultImageAction: ActionCreatorWithPayload<boolean>
) => {
  try {
    if (auth.currentUser) {
      const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
      await deleteObject(storageRef);
      dispatch(updateUserAction({ profilePic: "" }));
      dispatch(setShowDefaultImageAction(true));
    }
  } catch (error) {
    console.error("Error deleting profile image:", error);
  }
};

export const signOutUser = async (
  dispatch: AppDispatch,
  resetUserAction: any,
  resetChatStateAction: any,
  navigate: (path: string) => void
) => {
  try {
    await auth.signOut();
    dispatch(resetUserAction());
    dispatch(resetChatStateAction());
    navigate("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export const deleteUserAccount = async (
  dispatch: AppDispatch,
  resetUserAction: any,
  navigate: (path: string) => void
) => {
  try {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
      dispatch(resetUserAction());
      navigate("/");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const getUidFromEmail = async (email: string): Promise<string | null> => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().uid;
};
