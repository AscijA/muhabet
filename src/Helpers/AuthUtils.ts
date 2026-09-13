import { AppDispatch } from "src/store/store";
import { setCurrentChat } from "src/store/chatSlice";
import { updateUser } from "src/store/userSlice";
import { AuthFailure } from "src/domain/identity/AuthGateway";
import { AuthenticatedUser } from "src/domain/identity/User";
import { authServices } from "src/app/authServices";

const clearCurrentChat = (dispatch: AppDispatch) => dispatch(setCurrentChat({
  chatId: "", lastSeen: "", contact: { profilePic: "", email: "", uid: "" }, messages: [],
}));

const failureMessage: Record<AuthFailure, string> = {
  "weak-password": "Password has to be at least 6 characters long",
  "invalid-email": "Email is invalid",
  "email-in-use": "Email is already in use",
  "user-not-found": "Email/User not found",
  "invalid-credentials": "Invalid Credentials",
  "requires-recent-login": "Please sign in again before deleting your account.",
  unknown: "An Error Occurred",
};

const showFailure = (reason: AuthFailure, setErrorMessage: (value: string) => void, setShowError: (value: boolean) => void) => {
  setErrorMessage(failureMessage[reason]);
  setShowError(true);
};

export const subscribeToAuthChangesOnLogin = (dispatch: AppDispatch, navigate: (path: string) => void) =>
  authServices.auth.watchSession(user => {
    if (!user) { clearCurrentChat(dispatch); return; }
    dispatch(updateUser(user)); navigate("/chat");
  });

export const signUpUser = async (email: string, password: string, setErrorMessage: (value: string) => void, setShowError: (value: boolean) => void) => {
  const result = await authServices.auth.register(email, password);
  if (!result.ok) showFailure(result.reason, setErrorMessage, setShowError);
};

export const signInUser = async (
  email: string, password: string, dispatch: AppDispatch, navigate: (path: string) => void,
  setErrorMessage: (value: string) => void, setShowError: (value: boolean) => void,
) => {
  const result = await authServices.auth.signIn(email, password);
  if (!result.ok) { showFailure(result.reason, setErrorMessage, setShowError); return; }
  dispatch(updateUser(result.value)); navigate("/chat");
};

export const resetUserPassword = async (
  email: string, setShowResetModal: (value: boolean) => void,
  setErrorMessage: (value: string) => void, setShowError: (value: boolean) => void,
) => {
  const result = await authServices.auth.sendPasswordReset(email);
  if (!result.ok) { showFailure(result.reason, setErrorMessage, setShowError); return; }
  setShowResetModal(false);
};

export const subscribeToAuthChangesBasic = (callback: (user: AuthenticatedUser | null) => void) => authServices.auth.watchSession(callback);
