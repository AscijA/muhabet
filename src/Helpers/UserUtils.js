
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { updateChatByID, updateCurrentChatStatus } from "src/store/chatSlice";
import { auth, storage } from '../Firebase/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { setUser } from "src/store/userSlice";
import { db } from "src/Firebase/firebase";
import { deleteUser } from 'firebase/auth';

/**
 * Set up user object
 * @param {Object} authUser - Firebase auth user object
 * @param {Object} dispatch - Redux dispatch
 */
const userSetUp = async (authUser, dispatch) => {
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
    dispatch(updateCurrentChatStatus(chatStatus));
    if (handleShowContactInfoToggle) {
      handleShowContactInfoToggle();
    }
  };

  updateChat("chatStatus", chatStatus, currentChat.chatId)
    .then(dispatchChatUpdate(currentChatFull, chatStatus))
    .catch((error) => {
      console.error("Error deleting user:", error);
    });
};

const getUserProfileImage = async (dispatch, updateUser, setShowDefaultImage) => {
  try {
    const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    const url = await getDownloadURL(gsRef);
    dispatch(updateUser({ profilePic: url }));
    dispatch(setShowDefaultImage(false));
  } catch (error) {
    dispatch(setShowDefaultImage(true));
  }
};

const uploadProfileImage = async (file, dispatch, updateUser, setShowDefaultImage) => {
  try {
    const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    dispatch(updateUser({ profilePic: url }));
    dispatch(setShowDefaultImage(false));
  } catch (error) {
    console.error("Error uploading profile image:", error);
  }
};

const removeUserProfileImage = async (dispatch, updateUser, setShowDefaultImage) => {
  try {
    const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    await deleteObject(storageRef);
    dispatch(updateUser({ profilePic: "" }));
    dispatch(setShowDefaultImage(true));
  } catch (error) {
    console.error("Error deleting profile image:", error);
  }
};

const signOutUser = async (dispatch, resetUser, resetChatState, navigate) => {
  try {
    await auth.signOut();
    dispatch(resetUser());
    dispatch(resetChatState());
    navigate("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

const deleteUserAccount = async (dispatch, resetUser, navigate) => {
  try {
    await deleteUser(auth.currentUser);
    dispatch(resetUser());
    navigate("/");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export { userSetUp, updateChat, handleChatStatus, getUserProfileImage, uploadProfileImage, removeUserProfileImage, signOutUser, deleteUserAccount };
