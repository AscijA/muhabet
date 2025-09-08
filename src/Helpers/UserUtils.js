import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { updateChatByID } from "src/store/chatSlice";
import { auth, storage } from '../Firebase/firebase';
import { doc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { setUser } from "src/store/userSlice";
import { db } from "src/Firebase/firebase";
import { deleteUser } from 'firebase/auth';

/**
 * Set up user object
 * @param {Object} authUser - Firebase auth user object
 * @param {Function} dispatch - Redux dispatch
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
 * Generic: Update chat with new key/value
 *
 * @param {string} key - The key to update
 * @param {any} value - The value to update
 * @param {string} chatID - The chat ID
 */
const updateChat = async (key, value, chatID) => {
  const chatRef = doc(db, "chats", chatID);
  await updateDoc(chatRef, { [key]: value });
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
    });

    console.log("New chat created with ID:", chatRef.id);
    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
  }
};

/**
 * Toggle block/delete for the current user in this chat (new participants[] schema)
 *
 * @param {string} type - "block" | "delete"
 * @param {Object} chat - Chat slice state
 * @param {Object} currentUser - Current user object
 * @param {Function} dispatch - Redux dispatch
 * @param {Function|null} handleShowContactInfoToggle - optional UI toggle
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

  // Persist participants + participantIDs
  updateChatParticipants(currentChat.chatId, updatedParticipants)
    .then(() => dispatchChatUpdate())
    .catch((error) => {
      console.error("Error updating chat:", error);
    });
};

/**
 * Get user profile image from Firebase Storage
 *
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} updateUser - Redux action to update user
 * @param {Function} setShowDefaultImage - Redux action to show/hide default image
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
 * @param {File} file - The image file to upload
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} updateUser - Redux action to update user
 * @param {Function} setShowDefaultImage - Redux action to show/hide default image
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
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} updateUser - Redux action to update user
 * @param {Function} setShowDefaultImage - Redux action to show/hide default image
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
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} resetUser - Redux action to reset user
 * @param {Function} resetChatState - Redux action to reset chat state
 * @param {Function} navigate - Router Navigation function
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
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} resetUser - Redux action to reset user
 * @param {Function} navigate - Router Navigation function
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

/**
 * Resolve UID from an email via Firestore
 * @param {string} email
 * @returns {Promise<string|null>}
 */
export const getUidFromEmail = async (email) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data().uid;
};

export {
  userSetUp,
  updateChat,
  updateChatParticipants,
  handleChatStatus,
  getUserProfileImage,
  uploadProfileImage,
  removeUserProfileImage,
  signOutUser,
  deleteUserAccount,
  createChat
};
