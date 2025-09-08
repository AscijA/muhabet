import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "src/Firebase/firebase";
import { setAllChats } from "src/store/chatSlice";

/**
 *  Fetch all chats for the user ID
 * @param {string} userID
 * @param {function} dispatch
 */
const fetchChats = async (userID, dispatch) => {
 try {
  const chatsRef = collection(db, "chats");

  const q = query(
    chatsRef,
    where("participantIDs", "array-contains", userID),
    orderBy("lastModified", "desc")
  );

  const snapshot = await getDocs(q);

  const chats = snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  }));

  dispatch(setAllChats(chats));
} catch (error) {
  console.error("Error fetching chats:", error);
}

};

/**
 * Convert Firestore Timestamps to ISO strings in chat documents
 *
 * @param {*} docData
 * @return {*}
  */
const convertTimestamps = (docData) => {
  if (docData.lastModified instanceof Timestamp) {
    docData.lastModified = docData.lastModified.toDate().toISOString();
  }

  if (docData.messages) {
    docData.messages = docData.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Timestamp ? msg.timestamp.toDate().toISOString() : msg.timestamp
    }));
  }

  return docData;
};


export { fetchChats };