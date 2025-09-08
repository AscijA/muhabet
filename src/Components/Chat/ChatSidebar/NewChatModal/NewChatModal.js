import React, { useState } from 'react';
import styles from "./NewChatModal.module.scss";

import { useDispatch, useSelector } from 'react-redux';
import SettingsItem from 'src/Components/Common/SettingsItem/SettingsItem';
import CustomInput from 'src/Components/Common/CustomInput/CustomInput';
import { createChat, getUidFromEmail } from 'src/Helpers/UserUtils';
import { setCurrentChat, updateChatByID } from 'src/store/chatSlice';


/**
 * UserSettingsModal component that displays the user profile picture and email address.
 * Also allows the user to log out, delete their account or change profile picture. 
 */
const NewChatModal = (props) => {
  const dispatch = useDispatch();

  let currentUser = useSelector((state) => state.user);
  let allChats = useSelector((state) => state.chat.allChats);
  let [newEmail, setNewEmail] = useState("");
  let [errorMessage, setErrorMessage] = useState("");
  let [showError, setShowError] = useState(false);

  const confirmCreateChat = async () => {
    let user2UID = await getUidFromEmail(newEmail);

    if (!user2UID) {
      setErrorMessage("No user found with this email address.");
      setShowError(true);
      return;
    }
    if (newEmail === currentUser.email) {
      setErrorMessage("You cannot create a chat with yourself.");
      setShowError(true);
      return;
    }

    // Create chat object
    const chatData = {
      chatStatus: {
        user1Block: false,
        user1Del: false,
        user2Block: false,
        user2Del: false
      },
      lastMessageStatus: {
        status: "",
        userID: "",
      },
      messages: [],
      lastModified: "",
      user1Email: currentUser.email,
      user1ID: currentUser.uid,
      user2Email: newEmail,
      user2ID: user2UID
    };

    // Check if chat already exists
    let existingChat = allChats.find(chat =>
      (chat.user1ID === currentUser.uid && chat.user2ID === user2UID) ||
      (chat.user2ID === currentUser.uid && chat.user1ID === user2UID)
    );
    if (!existingChat) {
      let newChatId = await createChat(chatData);
      dispatch(updateChatByID(newChatId));
    }
    else {
      existingChat = {
        ...existingChat,
        chatStatus: {
          ...existingChat.chatStatus,
          user1Del: false,
          user2Del: false
        }
      };

      chatToCurrentChat(existingChat);

      dispatch(updateChatByID(existingChat));

    }
    props.handleToggleModal();
    setNewEmail("");

  };

  const chatToCurrentChat = (chatToCon) => {
    let currentChat = {
      chatId: chatToCon.id,
      lastSeen: "",
      contact: {
        profilePic: "",
        email: currentUser.email === chatToCon.user1Email ? chatToCon.user2Email : chatToCon.user1Email,
        uid: currentUser.email === chatToCon.user1Email ? chatToCon.user2ID : chatToCon.user1ID
      },
      messages: chatToCon.messages,
      chatStatus: chatToCon.chatStatus
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