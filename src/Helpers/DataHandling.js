import { setUser } from '../store/userSlice';
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from '../Firebase/firebase';
import { setAllChats } from 'src/store/chatSlice';

/**
 * Set up user object
 * @param {Object} authUser - Firebase auth user object
 * @param {Object} dispatch - Redux dispatch
 */
const userSetUp = (authUser, dispatch) => {
  const user = {
    email: authUser.email,
    displayName: authUser.displayName,
    emailVerified: authUser.emailVerified,
    createdAt: authUser.metadata.creationTime,
    uid: authUser.uid,
  };
  dispatch(setUser({ ...user }));
};

const fetchChats = async (userID, dispatch) => {
  try {
    // Firestore query to get chats where currentUserID is one of the participants
    const chatsRef = collection(db, "chats");

    // Query 1: user1ID == userID
    const q1 = query(
      chatsRef,
      where("user1ID", "==", userID),
      orderBy("lastModified", "desc")
    );

    // Query 2: user2ID == userID
    const q2 = query(
      chatsRef,
      where("user2ID", "==", userID),
      orderBy("lastModified", "desc")
    );

    // Run both queries in parallel
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);

    let chatsMap = new Map();

    // Helper function to convert Firestore timestamps
    const convertTimestamps = (docData) => {
      if (docData.lastModified instanceof Timestamp) {
        docData.lastModified = docData.lastModified.toDate().toISOString(); // Convert to ISO string
      }

      if (docData.messages) {
        docData.messages = docData.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Timestamp ? msg.timestamp.toDate().toISOString() : msg.timestamp
        }));
      }

      return docData;
    };

    // Process first query
    snapshot1.forEach(doc => {
      chatsMap.set(doc.id, { id: doc.id, ...convertTimestamps(doc.data()) });
    });

    // Process second query
    snapshot2.forEach(doc => {
      chatsMap.set(doc.id, { id: doc.id, ...convertTimestamps(doc.data()) });
    });

    const chats = Array.from(chatsMap.values());
    dispatch(setAllChats(chats));

  } catch (error) {
    console.error("Error fetching chats:", error);
  }

};


const updateChat = async () => {

};
export { userSetUp, fetchChats, updateChat };