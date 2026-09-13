import { conversationSubscriptions } from "src/app/chatServices";
import { setAllChats } from "src/store/chatSlice";
import { AppDispatch } from "src/store/store";

export const subscribeToChats = (userId: string, dispatch: AppDispatch, onReady?: () => void) => {
  let ready = false;
  return conversationSubscriptions.start(userId, conversations => {
    dispatch(setAllChats(conversations));
    if (ready) return;
    ready = true;
    onReady?.();
  });
};
