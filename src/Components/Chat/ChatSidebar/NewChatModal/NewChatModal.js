import React, { useState } from 'react';
import styles from "./NewChatModal.module.scss";

import { useDispatch, useSelector } from 'react-redux';
import SettingsItem from 'src/Components/Common/SettingsItem/SettingsItem';
import CustomInput from 'src/Components/Common/CustomInput/CustomInput';
import { getUidFromEmail } from 'src/Helpers/UserUtils';
import { createChat } from 'src/Helpers/ChatUtils';
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
      { userID: user2UID, email: newEmail, blockStatus: false, deleteStatus: false },
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
      if (Array.isArray(c?.participants)) {
        const ids = c.participants.map(p => p.userID);
        return participantIDs.every(id => ids.includes(id))
          && ids.length === participantIDs.length;
      }
      return false;
    });

    if (!existingChat) {
      const newChatId = await createChat(chatData);

      const newChat = {
        id: newChatId,
        chatId: newChatId,
        ...chatData,
      };

      // Push to store
      dispatch(updateChatByID(newChat));
      chatToCurrentChat(newChat);
    } else {
      const restoredParticipants = existingChat.participants?.map(p => ({
        ...p,
        deleteStatus: false,
      })) || participants;

      const merged = {
        ...existingChat,
        participants: restoredParticipants,
        participantIDs: existingChat.participantIDs || participantIDs,
      };

      dispatch(updateChatByID(merged));
      chatToCurrentChat(merged);
    }

    props.handleToggleModal();
    setNewEmail("");
  };

  const chatToCurrentChat = (chatToCon) => {
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
    };

    dispatch(setCurrentChat(currentChat));
  };

  const handleInputChange = (e) => {
    setNewEmail(e.target.value);
  };

  return (
    <div className={ styles.outerContainer }>
      <div className={ styles.inputContainer }>
        <form onSubmit={ (e) => { e.preventDefault(); confirmCreateChat(); } }>
          <CustomInput
            label="Email address"
            inputType="email"
            stateElement={ newEmail }
            stateElementChangeHandler={ handleInputChange }
          />
        </form>
      </div>

      { showError && <div className={ styles.errorMessage }>{ errorMessage }</div> }

      <div className={ styles.buttonsContainer }>
        <SettingsItem title="Confirm" onClick={ confirmCreateChat } />
        <SettingsItem title="Cancel" onClick={ props.handleToggleModal } color="red" />
      </div>
    </div>
  );
};

export default NewChatModal;
