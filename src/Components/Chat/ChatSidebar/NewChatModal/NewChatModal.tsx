import React, { useState } from 'react';
import styles from "./NewChatModal.module.scss";

import { useDispatch, useSelector } from 'react-redux';
import SettingsItem from 'src/Components/Common/SettingsItem/SettingsItem';
import CustomInput from 'src/Components/Common/CustomInput/CustomInput';
import { getUidFromEmail } from 'src/Helpers/UserUtils';
import { createChat } from 'src/Helpers/ChatUtils';
import { setCurrentChat, updateChatByID } from 'src/store/chatSlice';
import { RootState, AppDispatch } from 'src/store/store';
import { Chat } from 'src/types';

interface NewChatModalProps {
  handleToggleModal: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((state: RootState) => state.user);
  const allChats = useSelector((state: RootState) => state.chat.allChats);
  const [newEmail, setNewEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const confirmCreateChat = async () => {
    setShowError(false);
    setErrorMessage("");

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

    const user2UID = await getUidFromEmail(newEmail);
    if (!user2UID) {
      setErrorMessage("No user found with this email address.");
      setShowError(true);
      return;
    }

    const participants = [
      { userID: currentUser.uid, email: currentUser.email, blockStatus: false, deleteStatus: false },
      { userID: user2UID, email: newEmail, blockStatus: false, deleteStatus: false },
    ];
    const participantIDs = participants.map(p => p.userID);

    const chatData: Partial<Chat> = {
      participants,
      participantIDs,
      lastMessageStatus: { status: "", userID: "" },
      messages: [],
      lastModified: "", 
    };

    const existingChat = allChats.find(c => {
      if (Array.isArray(c?.participantIDs)) {
        return participantIDs.every(id => c.participantIDs?.includes(id))
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

      const newChat: Chat = {
        id: newChatId || "",
        chatId: newChatId || "",
        ...(chatData as any),
      };

      dispatch(updateChatByID(newChat));
      chatToCurrentChat(newChat);
    } else {
      const restoredParticipants = existingChat.participants?.map(p => ({
        ...p,
        deleteStatus: false,
      })) || participants;

      const merged: Chat = {
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

  const chatToCurrentChat = (chatToCon: Chat) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
