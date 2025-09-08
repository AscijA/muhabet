import React, { useEffect, useState } from 'react';
import styles from './Nav.module.scss';

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { toggleShowChatInfo, updateContact, setShowContactDefaultImage, setCurrentChat } from '../../store/chatSlice';
import { subscribeToAuthChangesBasic } from 'src/Helpers/AuthUtils';
import { fetchContactProfile } from 'src/Helpers/ContactUtils';
import { handleChatStatus } from "src/Helpers/UserUtils";

import userIcon from "../../assets/user.svg";

import UserSettingsModal from './UserSettingsModal/UserSettingsModal';
import ContactInfo from './ContactInfoModal/ContactInfoModal';
import BasicModal from '../Common/BasicModal/BasicModal';

/**
 * Navbar
 */
const Nav = () => {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  let user = useSelector((state) => state.user);
  let chat = useSelector((state) => state.chat);
  const showDefaultImage = useSelector((state) => state.chat.showDefaultImage);
  const showContact = useSelector((state) => state.chat.showContactDefaultImage);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChangesBasic((user) => {
      if (!user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchContactProfile(chat.currentChat?.contact?.uid, dispatch, updateContact, setShowContactDefaultImage);
  }, [chat.currentChat?.contact?.uid, dispatch]);

  const handleShowSettingsToggle = () => {
    setShowSettings(prev => !prev);
  };

  const handleShowContactInfoToggle = () => {
    dispatch(toggleShowChatInfo());
  };

  const blockUser = () => { handleChatStatus("block", chat, user, dispatch, handleShowContactInfoToggle); };

  const deleteChat = () => {
    handleChatStatus("delete", chat, user, dispatch, handleShowContactInfoToggle);
    dispatch(setCurrentChat({
      chatId: 0,
      lastSeen: "",
      contact: {
        profilePic: "",
        email: "",
        uid: ""
      },
      messages: [
        {}
      ]
    },));

  };

  return (
    <div className={ styles.main }>
      <div className={ styles.side }>
        <div className={ styles.contactNav } onClick={ handleShowSettingsToggle }>
          <div className={ showDefaultImage ? styles.contactPicBG : styles.contactPic }>
            <img className={ styles.contactPicImg } src={ showDefaultImage ? userIcon : user.profilePic } alt="Profile" />
          </div>
          <div className={ styles.userName } >{ user.email }</div>
        </div>
        <div className={ styles.settingsButton } onClick={ handleShowSettingsToggle }><span>Settings</span></div>
      </div>
      <div className={ styles.chatContent }>
        { chat.currentChat.contact.uid && (
          <div className={ styles.contactNav } onClick={ handleShowContactInfoToggle } >
            <div className={ showContact ? styles.contactPicBG : styles.contactPic }>
              <img className={ styles.contactPicImg } src={ showContact ? userIcon : chat.currentChat.contact.profilePic } alt="Profile" />
            </div>
            <div>{ chat.currentChat.contact.email }</div>
          </div>
        ) }
      </div>

      { showSettings &&
        <BasicModal handleToggleModal={ handleShowSettingsToggle } fullscreen={ true } transparent={ true }>
          <UserSettingsModal />
        </BasicModal>
      }

      { chat.showChatInfo &&
        <BasicModal handleToggleModal={ handleShowContactInfoToggle } fullscreen={ true } transparent={ true }>
          <ContactInfo handleBlockUser={ blockUser } handleDeleteChat={ deleteChat } email={ user.email } />
        </BasicModal>
      }
    </div>
  );
};

export default Nav;
