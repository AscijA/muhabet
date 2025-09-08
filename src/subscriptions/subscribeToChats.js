import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "src/Firebase/firebase";
import { upsertChatSorted, removeChatByID } from "src/store/chatSlice";

const toMillis = (v) => {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis(); // Firestore Timestamp
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
};

// optional: normalize nested message timestamps too
const normalizeMessages = (msgs) =>
  Array.isArray(msgs)
    ? msgs.map(m => ({
      ...m,
      timestamp: toMillis(m?.timestamp),
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
 * Keeps Redux state incrementally updated and sorted by lastModified.
 *
 * @param {string} userID
 * @param {Function} dispatch
 * @param {Function} [onReady] - called once after the first snapshot arrives
 * @returns {Function} unsubscribe
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
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") {
          dispatch(removeChatByID(change.doc.id));
          return;
        }
        const chat = normalizeChat(change.doc);
        dispatch(upsertChatSorted(chat)); // "added" and "modified"
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
        onReady?.(); // don't leave UI stuck loading
      }
    }
  );

  return unsubscribe;
};
