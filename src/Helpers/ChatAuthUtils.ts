import { authServices } from "src/app/authServices";
import { chatServices } from "src/app/chatServices";
import { setCurrentChat, setShowDefaultImage } from "src/store/chatSlice";
import { AppDispatch } from "src/store/store";
import { updateUser } from "src/store/userSlice";
import { subscribeToChats } from "src/subscriptions/subscribeToChats";

const clearCurrentChat = (dispatch: AppDispatch) => dispatch(setCurrentChat({
  chatId: "", lastSeen: "", contact: { profilePic: "", email: "", uid: "" }, messages: [],
}));

export const subscribeToAuthChangesOnChatLoad = (
  dispatch: AppDispatch,
  setLoading: (loading: boolean) => void,
  navigate?: (path: string) => void,
) => {
  let unsubscribeChats: (() => void) | null = null;
  const unsubscribeAuth = authServices.auth.watchSession(user => {
    unsubscribeChats?.();
    unsubscribeChats = null;
    if (!user) {
      void chatServices.profiles.endSession();
      clearCurrentChat(dispatch); setLoading(false); navigate?.("/"); return;
    }
    chatServices.profiles.startSession(user.uid);
    dispatch(updateUser(user));
    chatServices.profiles.getImage(user.uid).then(image => {
      if (!image) return;
      dispatch(updateUser({ profilePic: image.url }));
      dispatch(setShowDefaultImage(false));
    });
    unsubscribeChats = subscribeToChats(user.uid, dispatch, () => setLoading(false));
  });
  return () => { unsubscribeChats?.(); unsubscribeAuth(); };
};
