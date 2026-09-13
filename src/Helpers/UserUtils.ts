import { UserState } from "src/store/userSlice";
import { AppDispatch } from "src/store/store";
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { createDeleteAccountUseCase } from "src/application/identity/deleteAccountUseCase";
import { authServices } from "src/app/authServices";
import { chatServices } from "src/app/chatServices";
import { validateProfileImage } from "src/domain/profiles/profileImagePolicy";

const deleteAccount = createDeleteAccountUseCase({ auth: authServices.auth, profiles: chatServices.profiles });

export const getUserProfileImage = async (
  userId: string,
  dispatch: AppDispatch,
  updateUserAction: ActionCreatorWithPayload<Partial<UserState>>,
  setShowDefaultImageAction: ActionCreatorWithPayload<boolean>
) => {
  if (!userId) { dispatch(setShowDefaultImageAction(true)); return; }
  const image = await chatServices.profiles.getImage(userId);
  dispatch(setShowDefaultImageAction(!image));
  if (image) dispatch(updateUserAction({ profilePic: image.url }));
};

export const uploadProfileImage = async (
  userId: string,
  file: File,
  dispatch: AppDispatch,
  updateUserAction: ActionCreatorWithPayload<Partial<UserState>>,
  setShowDefaultImageAction: ActionCreatorWithPayload<boolean>
) => {
  const validation = validateProfileImage(file);
  if (!validation.ok) return validation.message;
  try {
    if (userId) {
      const image = await chatServices.profiles.uploadImage(userId, file);
      dispatch(updateUserAction({ profilePic: image.url }));
      dispatch(setShowDefaultImageAction(false));
    }
    return null;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return "The profile image could not be uploaded. Please try again.";
  }
};

export const removeUserProfileImage = async (
  userId: string,
  dispatch: AppDispatch,
  updateUserAction: ActionCreatorWithPayload<Partial<UserState>>,
  setShowDefaultImageAction: ActionCreatorWithPayload<boolean>
) => {
  try {
    if (userId) {
      await chatServices.profiles.removeImage(userId);
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
    const result = await authServices.auth.signOut();
    if (!result.ok) throw new Error(result.reason);
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
  resetChatStateAction: any,
  navigate: (path: string) => void
) => {
  try {
    const result = await deleteAccount();
    if (!result.ok) throw new Error(result.reason);
    dispatch(resetUserAction());
    dispatch(resetChatStateAction());
    navigate("/");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const getUidFromEmail = async (email: string): Promise<string | null> => {
  return chatServices.userDirectory.findByEmail(email);
};
