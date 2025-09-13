import React, { useState, useMemo } from 'react';
import styles from './ContactInfoModal.module.scss';

import { useSelector } from 'react-redux';

import ConfirmationWindow from '../../Common/ConfirmationWindow/ConfirmationWindow';
import SettingsItem from '../../Common/SettingsItem/SettingsItem';
import userIcon from "../../../assets/user.svg";

/**
 * Modal for the contact info settings.
 *
 * @param {function} handleDeleteChat - handle deletion of the chat
 * @param {function} handleBlockUser  - handle blocking/unblocking the user
 * @param {string}   [email]          - optional email to display; falls back to currentChat.contact.email
 */
const ContactInfoModal = (props) => {
  const currentUser = useSelector((state) => state.user);
  const { currentChat, allChats, showContactDefaultImage: showContact } = useSelector((state) => state.chat);

  const [showConfirmWindowDeleteChat, setDisplayConfirmDeleteChat] = useState(false);
  const [showConfirmWindowBlockUser, setDisplayConfirmBlockUser] = useState(false);

  const chatFull = useMemo(
    () => allChats.find(c => c.id === currentChat.chatId),
    [allChats, currentChat.chatId]
  );
  const me = chatFull?.participants?.find(p => p.userID === currentUser.uid) ?? null;

  const displayOtherEmail = currentChat?.contact?.email ?? "";
  const displayPic = showContact
    ? userIcon
    : (currentChat?.contact?.profilePic || userIcon);

  const chatStatusBlock = me?.blockStatus ?? false;

  const blockButtonText = chatStatusBlock ? "Unblock User" : "Block User";
  const confirmBlockTitle = chatStatusBlock
    ? "Are you sure you want to unblock this user?"
    : "Are you sure you want to block this user?";

  const handleShowConfirmationWindowDeleteChat = () => {
    setDisplayConfirmDeleteChat(v => !v);
  };
  const handleShowConfirmationWindowBlockUser = () => {
    setDisplayConfirmBlockUser(v => !v);
  };

  return (
    <>
      <div className={ styles.contactInfo }>
        <div className={ showContact ? styles.contactPicBG : styles.contactPic }>
          <img className={ styles.contactPicImg } src={ displayPic } alt="Profile" />
        </div>

        <div className={ styles.email }>
          { displayOtherEmail }
        </div>

        <SettingsItem title="Delete Chat" onClick={ handleShowConfirmationWindowDeleteChat } />
        <SettingsItem title={ blockButtonText } onClick={ handleShowConfirmationWindowBlockUser } />
      </div>

      { showConfirmWindowDeleteChat && (
        <ConfirmationWindow
          text="Are you sure you want to delete this chat? This action cannot be undone."
          buttons={ [
            {
              text: "Yes",
              onClick: () => {
                props.handleDeleteChat?.();
                handleShowConfirmationWindowDeleteChat();
              },
            },
            { text: "No", onClick: handleShowConfirmationWindowDeleteChat },
          ] }
          handleToggleModal={ handleShowConfirmationWindowDeleteChat }
        />
      ) }

      { showConfirmWindowBlockUser && (
        <ConfirmationWindow
          text={ confirmBlockTitle }
          buttons={ [
            {
              text: "Yes",
              onClick: () => {
                props.handleBlockUser?.();
                handleShowConfirmationWindowBlockUser();
              },
            },
            { text: "No", onClick: handleShowConfirmationWindowBlockUser },
          ] }
          handleToggleModal={ handleShowConfirmationWindowBlockUser }
        />
      ) }
    </>
  );
};

export default ContactInfoModal;
