import React, { useState } from 'react';
import styles from './ContactInfoModal.module.scss';

import { useSelector } from 'react-redux';

import ConfirmationWindow from '../../Common/ConfirmationWindow/ConfirmationWindow';
import SettingsItem from '../../Common/SettingsItem/SettingsItem';

/** Modal for the contact info settings.
 * 
 * @param {function} handleDeleteChat - A function to handle the deletion of the chat.
 * @param {function} handleBlockUser - A function to handle the blocking of the user.
 */
const ContactInfoModal = (props) => {
  let currentUser = useSelector((state) => state.user);
  let chat = useSelector((state) => state.chat);

  const [showConfirmWindowDeleteChat, setDisplayConfirmDeleteChat] = useState(false);
  const [showConfirmWindowBlockUser, setDisplayConfirmBlockUser] = useState(false);

  let chatStatusBlock = currentUser.uid === chat.currentChat.user1ID ? chat.currentChat.chatStatus.user2Block : chat.currentChat.chatStatus.user1Block;

  let text = chatStatusBlock ? "Unblock User" : "Block User";
  let confirmTextTitle = chatStatusBlock ? "Are you sure you want to unblock this user?" : "Are you sure you want to block this user?";

  const handleShowConfirmationWindowDeleteChat = () => {
    setDisplayConfirmDeleteChat(oldState => !oldState);
  };
  const handleShowConfirmationWindowBlockUser = () => {
    setDisplayConfirmBlockUser(oldState => !oldState);
  };

  return (
    <>
      <div className={ styles.contactInfo }>
        <SettingsItem
          title="Delete Chat"
          onClick={ handleShowConfirmationWindowDeleteChat } />
        <SettingsItem
          title={ text }
          onClick={ handleShowConfirmationWindowBlockUser } />
      </div>

      { showConfirmWindowDeleteChat &&
        (<ConfirmationWindow
          text="Are you sure you want to delete this chat? This action cannot be undone."
          buttons={ [
            {
              text: "Yes", onClick: () => {
                props.handleDeleteChat();
                handleShowConfirmationWindowDeleteChat();
              }
            },
            {
              text: "No",
              onClick: handleShowConfirmationWindowDeleteChat
            }
          ] }
          handleToggleModal={ handleShowConfirmationWindowDeleteChat }
        />) }

      { showConfirmWindowBlockUser &&
        (<ConfirmationWindow
          text={ confirmTextTitle }
          buttons={ [
            {
              text: "Yes", onClick: () => {
                props.handleBlockUser();
                handleShowConfirmationWindowBlockUser();
              }
            },
            {
              text: "No",
              onClick: handleShowConfirmationWindowBlockUser
            }
          ] }
          handleToggleModal={ handleShowConfirmationWindowBlockUser }
        />) }
    </>
  );
};

export default ContactInfoModal;