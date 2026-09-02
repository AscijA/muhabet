import { doc, updateDoc, collection, getDocs, query, where, orderBy, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "src/Firebase/firebase";
import { setAllChats, updateChatByID } from "src/store/chatSlice";
import { setDoc } from "firebase/firestore";


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



/**
 * Specific: Update participants and keep participantIDs in sync
 * @param {string} chatID
 * @param {Array} participants
 */
const updateChatParticipants = async (chatID, participants) => {
  const chatRef = doc(db, "chats", chatID);
  const participantIDs = Array.isArray(participants)
    ? participants.map(p => p.userID)
    : [];
  await updateDoc(chatRef, {
    participants,
    participantIDs,
    lastModified: serverTimestamp(),
  });
};

const createChat = async (chatData) => {
  try {
    const chatRef = doc(collection(db, "chats")); // generates a unique ID
    const participantIDs = Array.isArray(chatData.participants)
      ? chatData.participants.map(p => p.userID)
      : [];

    await setDoc(chatRef, {
      ...chatData,
      chatId: chatRef.id,
      participantIDs,
      lastModified: serverTimestamp(),
    });

    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
  }
};

/**
 * Toggle block/delete for the current user in this chat (participants[] schema)
 */
const handleChatStatus = (
  type = "block",
  chat,
  currentUser,
  dispatch,
  handleShowContactInfoToggle = null
) => {
  const { currentChat, allChats } = chat;
  let currentChatFull = allChats.find(c => c.id === currentChat.chatId);
  const currentUserUid = currentUser.uid;

  if (!currentChatFull?.participants) return;

  // Toggle the current user's flag in participants
  const updatedParticipants = currentChatFull.participants.map(p => {
    if (p.userID !== currentUserUid) return p;
    if (type === "delete") {
      return { ...p, deleteStatus: !p.deleteStatus };
    }
    return { ...p, blockStatus: !p.blockStatus };
  });

  const updatedChat = {
    ...currentChatFull,
    participants: updatedParticipants
  };

  const dispatchChatUpdate = () => {
    dispatch(updateChatByID(updatedChat));
    if (handleShowContactInfoToggle) handleShowContactInfoToggle();
  };

  // Persist participants + participantIDs + lastModified
  updateChatParticipants(currentChat.chatId, updatedParticipants)
    .then(() => dispatchChatUpdate())
    .catch((error) => {
      console.error("Error updating chat:", error);
    });
};

/**
 * Generic: Update chat with new key/value
 *
 * @param {string} key - The key to update
 * @param {any} value - The value to update
 * @param {string} chatID - The chat ID
 */
const updateChat = async (key, value, chatID) => {
  const chatRef = doc(db, "chats", chatID);
  await updateDoc(chatRef, { [key]: value, lastModified: serverTimestamp() });
};

const updateChatNoModify = async (key, value, chatID) => {
  const chatRef = doc(db, "chats", chatID);
  await updateDoc(chatRef, { [key]: value });
};


export const addMessageToSubcollection = async (chatID, message) => {
  const msgRef = doc(collection(db, "chats", chatID, "messages"), message.messageID);
  await setDoc(msgRef, message);
  await updateDoc(doc(db, "chats", chatID), { lastModified: serverTimestamp() });
};

export const updateMessageInSubcollection = async (chatID, messageID, updates) => {
  const msgRef = doc(db, "chats", chatID, "messages", messageID);
  await updateDoc(msgRef, updates);
};

export { fetchChats, updateChatParticipants, createChat, handleChatStatus, updateChat, updateChatNoModify };
