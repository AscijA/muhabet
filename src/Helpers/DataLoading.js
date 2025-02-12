import { setUser } from '../store/userSlice';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from '../Firebase/firebase';

/**
 * Set up user object
 * @param {Object} authUser - Firebase auth user object
 * @param {Object} dispatch - Redux dispatch
 */
export function userSetUp(authUser, dispatch) {
  const user = {
    email: authUser.email,
    displayName: authUser.displayName,
    emailVerified: authUser.emailVerified,
    createdAt: authUser.metadata.creationTime,
    uid: authUser.uid,
  };
  dispatch(setUser({ ...user }));
}

export async function fetchChats(userID, dispatch) {
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

    // Add results from first query
    snapshot1.forEach(doc => {
      chatsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Add results from second query (avoiding duplicates)
    snapshot2.forEach(doc => {
      chatsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Convert Map to array
    const chats = Array.from(chatsMap.values());

    dispatch({ type: "setAllChats", payload: chats });

  } catch (error) {
    console.error("Error fetching chats:", error);
  }

};
