// subscribeToChats.js
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "src/Firebase/firebase";
import { upsertChatSorted, removeChatByID } from "src/store/chatSlice";
import { updateChatNoModify } from "src/Helpers/ChatUtils";
import { MESSAGE_STATUS } from "src/Helpers/Constants";

const toMillis = (v) => {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
};

const normalizeMessages = (msgs) =>
  Array.isArray(msgs)
    ? msgs.map(m => ({
        ...m,
        timestamp: toMillis(m?.timestamp),
        messageStatus: m?.messageStatus ?? MESSAGE_STATUS.SENT,  
      }))
    : [];

const normalizeChat = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    lastModified: toMillis(data?.lastModified),
    messages: normalizeMessages(data?.messages),
  };
};

/**
 * Realtime subscription for all chats where the user participates.
 * - Keeps Redux state incrementally updated and sorted by lastModified.
 * - Promotes incoming messages from SENT -> DELIVERED once they reach this device.
 */
export const subscribeToChats = (userID, dispatch, onReady) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participantIDs", "array-contains", userID),
    orderBy("lastModified", "desc")
  );

  let first = true;

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const pendingDeliveries = [];

      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          dispatch(removeChatByID(change.doc.id));
          return;
        }

        const chat = normalizeChat(change.doc);

        const updatedMsgs = chat.messages.map(m => {
          if (m.ownerID !== userID && m.messageStatus === MESSAGE_STATUS.SENT) {
            return { ...m, messageStatus: MESSAGE_STATUS.DELIVERED };
          }
          return m; 
        });

        let changed = false;
        for (let i = 0; i < chat.messages.length; i++) {
          if (chat.messages[i] !== updatedMsgs[i]) { changed = true; break; }
        }
        if (changed) {
          pendingDeliveries.push({ chatId: chat.id, messages: updatedMsgs });
          chat.messages = updatedMsgs;
        }

        dispatch(upsertChatSorted(chat));
      });

      for (const { chatId, messages } of pendingDeliveries) {
        try {
          await updateChatNoModify("messages", messages, chatId);
        } catch (e) {
          console.error("Failed promoting SENT->DELIVERED:", chatId, e);
        }
      }

      if (first) {
        first = false;
        onReady?.();
      }
    },
    (error) => {
      console.error("Chats subscription error:", error);
      if (first) {
        first = false;
        onReady?.();
      }
    }
  );

  return unsubscribe;
};
