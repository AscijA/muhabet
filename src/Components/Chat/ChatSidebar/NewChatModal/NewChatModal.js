import React, { useState } from 'react';
import styles from "./NewChatModal.module.scss";

import { useDispatch, useSelector } from 'react-redux';
import SettingsItem from 'src/Components/Common/SettingsItem/SettingsItem';
import CustomInput from 'src/Components/Common/CustomInput/CustomInput';
import { createChat, getUidFromEmail } from 'src/Helpers/UserUtils';
import { setCurrentChat, updateChatByID } from 'src/store/chatSlice';

/**
 * NewChatModal: creates a 1:1 chat using the new participants[] schema.
 */
const NewChatModal = (props) => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.user);
  const allChats = useSelector((state) => state.chat.allChats);
  const [newEmail, setNewEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const confirmCreateChat = async () => {
    setShowError(false);
    setErrorMessage("");

    // Basic validation
    if (!newEmail) {
      setErrorMessage("Please enter an email address.");
      setShowError(true);
      return;
    }
    if (newEmail === currentUser.email) {
      setErrorMessage("You cannot create a chat with yourself.");
      setShowError(true);
      return;
    }

    // Look up the other user's UID
    const user2UID = await getUidFromEmail(newEmail);
    if (!user2UID) {
      setErrorMessage("No user found with this email address.");
      setShowError(true);
      return;
    }

    // Build new schema fields
    const participants = [
      { userID: currentUser.uid, email: currentUser.email, blockStatus: false, deleteStatus: false },
      { userID: user2UID,        email: newEmail,          blockStatus: false, deleteStatus: false },
    ];
    const participantIDs = participants.map(p => p.userID);

    const chatData = {
      participants,
      participantIDs,
      lastMessageStatus: { status: "", userID: "" },
      messages: [],
      lastModified: "", // keep as-is if your backend sets this later
    };

    // De-dupe: find existing chat with the same two participant IDs
    const existingChat = allChats.find(c => {
      if (Array.isArray(c?.participantIDs)) {
        // Fast path if the array exists
        return participantIDs.every(id => c.participantIDs.includes(id))
               && c.participantIDs.length === participantIDs.length;
      }
      // Fallback if participantIDs not present locally yet (e.g., pending migration)
      if (Array.isArray(c?.participants)) {
        const ids = c.participants.map(p => p.userID);
        return participantIDs.every(id => ids.includes(id))
               && ids.length === participantIDs.length;
      }
      return false;
    });

    if (!existingChat) {
      // Create on Firestore
      const newChatId = await createChat(chatData);

      // Construct a local chat object for the store
      const newChat = {
        id: newChatId,
        chatId: newChatId,
        ...chatData,
      };

      // Push to store
      dispatch(updateChatByID(newChat));
      chatToCurrentChat(newChat);
    } else {
      // If it exists, "undelete" for both users (matches old behavior resetting user1Del/user2Del)
      const restoredParticipants = existingChat.participants?.map(p => ({
        ...p,
        deleteStatus: false,
      })) || participants;

      const merged = {
        ...existingChat,
        participants: restoredParticipants,
        participantIDs: existingChat.participantIDs || participantIDs,
      };

      // Update Redux (persist to Firestore elsewhere if desired)
      dispatch(updateChatByID(merged));
      chatToCurrentChat(merged);
    }

    // Close modal and reset input
    props.handleToggleModal();
    setNewEmail("");
  };

  const chatToCurrentChat = (chatToCon) => {
    // Find the "other" participant
    const other = Array.isArray(chatToCon.participants)
      ? chatToCon.participants.find(p => p.userID !== currentUser.uid)
      : null;

    const currentChat = {
      chatId: chatToCon.id,
      lastSeen: "",
      contact: {
        profilePic: "",
        email: other?.email || "",
        uid: other?.userID || "",
      },
      messages: chatToCon.messages || [],
      // If your UI still reads chatStatus, you can derive it here if needed,
      // but ideally migrate UI to read from participants[] instead.
    };

    dispatch(setCurrentChat(currentChat));
  };

  const handleInputChange = (e) => {
    setNewEmail(e.target.value);
  };

  return (
    <div className={styles.outerContainer}>
      <div className={styles.inputContainer}>
        <form onSubmit={(e) => { e.preventDefault(); confirmCreateChat(); }}>
          <CustomInput
            label="Email address"
            inputType="email"
            stateElement={newEmail}
            stateElementChangeHandler={handleInputChange}
          />
        </form>
      </div>

      {showError && <div className={styles.errorMessage}>{errorMessage}</div>}

      <div className={styles.buttonsContainer}>
        <SettingsItem title="Confirm" onClick={confirmCreateChat} />
        <SettingsItem title="Cancel" onClick={props.handleToggleModal} color="red" />
      </div>
    </div>
  );
};

export default NewChatModal;
