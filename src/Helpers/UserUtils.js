
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { updateChatByID, updateCurrentChatStatus } from "src/store/chatSlice";
import { auth, storage } from '../Firebase/firebase';
import { doc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
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

const createChat = async (chatData) => {
  try {
    const chatRef = doc(collection(db, "chats")); // generates a unique ID
    await setDoc(chatRef, { ...chatData, chatId: chatRef.id });
    console.log("New chat created with ID:", chatRef.id);
    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
  }
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
        user1Del: !chatStatus.user1Del
      };
    }
    else {
      chatStatus = {
        ...chatStatus,
        user2Del: !chatStatus.user2Del
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
      console.error("Error updating chat:", error);
    });
};

/**
 * Get user profile image from Firebase Storage
 *
 * @param {*} dispatch - Redux dispatch function
 * @param {*} updateUser - Redux action to update user
 * @param {*} setShowDefaultImage - Redux action to show/hide default image
 */
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

/**
 * Upload user profile image to Firebase Storage
 *
 * @param {*} file - The image file to upload
 * @param {*} dispatch - Redux dispatch function
 * @param {*} updateUser - Redux action to update user
 * @param {*} setShowDefaultImage - Redux action to show/hide default image
 */
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

/**
 * Remove user profile image from Firebase Storage
 *
 * @param {*} dispatch - Redux dispatch function
 * @param {*} updateUser - Redux action to update user
 * @param {*} setShowDefaultImage - Redux action to show/hide default image
 */
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

/**
 * Sign out user and reset state
 *
 * @param {*} dispatch - Redux dispatch function
 * @param {*} resetUser - Redux action to reset user
 * @param {*} resetChatState - Redux action to reset chat state
 * @param {*} navigate - Router Navigation function 
 */
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

/**
 * Delete user account from Firebase
 *
 * @param {*} dispatch - Redux dispatch function
 * @param {*} resetUser - Redux action to reset user
 * @param {*} navigate - Router Navigation function
 */
const deleteUserAccount = async (dispatch, resetUser, navigate) => {
  try {
    await deleteUser(auth.currentUser);
    dispatch(resetUser());
    navigate("/");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const getUidFromEmail = async (email) => {
  const q = query(
    collection(db, "users"),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0].data().uid;

  return doc; 
};

export { userSetUp, updateChat, handleChatStatus, getUserProfileImage, uploadProfileImage, removeUserProfileImage, signOutUser, deleteUserAccount, createChat };
