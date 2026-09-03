// subscribeToChats.js
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "src/Firebase/firebase";
import { upsertChatSorted, removeChatByID, updateChatByID } from "src/store/chatSlice";
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
    participants: data?.participants || [],
    lastModified: toMillis(data?.lastModified),
    messages: normalizeMessages(data?.messages),
  };
};

const normalizeMessageDoc = (docSnap) => {
  const m = docSnap.data();
  return {
    ...m,
    timestamp: toMillis(m?.timestamp),
    messageStatus: m?.messageStatus ?? MESSAGE_STATUS.SENT,
    messageID: docSnap.id,
  };
};

let messageListeners = {};

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
      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          dispatch(removeChatByID(change.doc.id));
          if (messageListeners[change.doc.id]) {
            messageListeners[change.doc.id]();
            delete messageListeners[change.doc.id];
          }
          return;
        }

        const chat = normalizeChat(change.doc);
        
        // Remove the messages array normalization from the chat document itself
        delete chat.messages;

        // Dispatch the chat metadata
        dispatch(upsertChatSorted(chat));

        // Setup message subcollection listener if not exists
        if (!messageListeners[chat.id]) {
          const msgsQ = query(
            collection(db, "chats", chat.id, "messages"),
            orderBy("timestamp", "asc")
          );
          
          messageListeners[chat.id] = onSnapshot(msgsQ, (msgSnap) => {
            const msgs = msgSnap.docs.map(normalizeMessageDoc);
            dispatch(updateChatByID({ id: chat.id, messages: msgs }));
            
            // Promote SENT -> DELIVERED
            msgs.forEach(m => {
              if (m.ownerID !== userID && m.messageStatus === MESSAGE_STATUS.SENT) {
                import("src/Helpers/ChatUtils").then(({ updateMessageInSubcollection }) => {
                   updateMessageInSubcollection(chat.id, m.messageID, { messageStatus: MESSAGE_STATUS.DELIVERED })
                     .catch(e => console.error("Failed promoting SENT->DELIVERED:", chat.id, m.messageID, e));
                });
              }
            });
          });
        }
      });

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

  return () => {
    unsubscribe();
    Object.values(messageListeners).forEach(unsub => unsub());
    messageListeners = {};
  };
};
