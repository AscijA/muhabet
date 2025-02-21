import { collection, getDocs, query, where, orderBy, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from '../Firebase/firebase';

import { setAllChats, updateChatByID, updateChatStatus } from 'src/store/chatSlice';
import { setUser } from '../store/userSlice';

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
 *  Update chat with new key value pair
 * 
 * @param {string} key - The key to update
 * @param {any} value - The value to update
 * @param {string} chatID - The chat ID
 */
const updateChat = async (key, value, chatID) => {
  const chatRef = doc(db, "chats", chatID);

  await updateDoc(chatRef, {
    [key]: value,
  });

};

/**
 * 
 * @param {string} type - The type of action to perform
 * @param {Object} chat - The chat object
 * @param {Object} currentUser - The current user object
 * @param {function} dispatch - Redux dispatch
 * @param {function} handleShowContactInfoToggle - The function to toggle the contact info
 */
const handleChatStatus = (type = "block", chat, currentUser, dispatch, handleShowContactInfoToggle = null) => {
  let currentChat = chat.currentChat;
  let allChats = chat.allChats;
  let chatStatus = chat.currentChat.chatStatus;
  let currentChatFull = allChats.find(chat => chat.id === currentChat.chatId);
  let currentUserUid = currentUser.uid;

  if (type === "delete") {
    if (currentUserUid === currentChatFull.user1ID) {
      chatStatus = {
        ...chatStatus,
        user1Del: true
      };
    }
    else {
      chatStatus = {
        ...chatStatus,
        user2Del: true
      };
    }
  }
  else {
    if (currentUserUid === currentChatFull.user1ID) {
      chatStatus = {
        ...chatStatus,
        user1Block: !chatStatus.user1Block,
      };
    }
    else {
      chatStatus = {
        ...chatStatus,
        user2Block: !chatStatus.user2Block,
      };
    }
  }

  currentChatFull = {
    ...currentChatFull,
    chatStatus: chatStatus
  };

  /**
   * Update chat status Redux state
   * @param {*} currentChatFull 
   * @param {*} chatStatus 
   */
  const dispatchChatUpdate = (currentChatFull, chatStatus) => {
    dispatch(updateChatByID(currentChatFull));
    dispatch(updateChatStatus(chatStatus));
    if (handleShowContactInfoToggle) {
      handleShowContactInfoToggle();
    }
  };

  updateChat("chatStatus", chatStatus, currentChat.chatId)
    .then(dispatchChatUpdate(currentChatFull, chatStatus)).catch((error) => {
      console.error("Error deleting user:", error);
    });
};

export { userSetUp, fetchChats, updateChat, handleChatStatus };