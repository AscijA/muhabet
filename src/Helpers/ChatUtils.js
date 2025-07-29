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

    const q1 = query(
      chatsRef,
      where("user1ID", "==", userID),
      orderBy("lastModified", "desc")
    );

    const q2 = query(
      chatsRef,
      where("user2ID", "==", userID),
      orderBy("lastModified", "desc")
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);

    let chatsMap = new Map();

    snapshot1.forEach(doc => {
      chatsMap.set(doc.id, { id: doc.id, ...convertTimestamps(doc.data()) });
    });

    snapshot2.forEach(doc => {
      chatsMap.set(doc.id, { id: doc.id, ...convertTimestamps(doc.data()) });
    });

    const chats = Array.from(chatsMap.values());
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