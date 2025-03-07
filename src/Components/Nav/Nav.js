import React, { useEffect, useState } from 'react';
import styles from './Nav.module.scss';

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { storage, auth } from "../../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';

import { toggleShowChatInfo, updateContact, setShowContactDefaultImage } from '../../store/chatSlice';
import { handleChatStatus } from '../../Helpers/DataHandling';
import { getContactImage, getImageFromFirebaseAndSaveToIDB } from 'src/Helpers/idb';

import userIcon from "../../assets/user.svg";

import UserSettingsModal from '../UserSettingsModal/UserSettingsModal';
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (chat.currentChat?.contact?.uid) {
      getContactImage(chat.currentChat?.contact?.uid).then((image) => {
        if (image) {
          dispatch(updateContact({ profilePic: URL.createObjectURL(image) }));
          dispatch(setShowContactDefaultImage(false));

        }
        const contactRef = ref(storage, `profile-pics/${chat.currentChat.contact.uid}`);

        getDownloadURL(contactRef)
          .then((url) => {
            dispatch(updateContact({ profilePic: url }));
            dispatch(setShowContactDefaultImage(false));
            getImageFromFirebaseAndSaveToIDB(chat.currentChat?.contact?.uid, url);

          })
          .catch((error) => {
            dispatch(setShowContactDefaultImage(true));
            console.error("Error fetching contact profile pic:", error);
          });
      });
    }
  }, [chat.currentChat?.contact?.uid, dispatch]);

  const handleShowSettingsToggle = () => {
    setShowSettings(oldState => !oldState);
  };

  const handleShowContactInfoToggle = () => {
    dispatch(toggleShowChatInfo());
  };

  const blockUser = () => { handleChatStatus("block", chat, user, dispatch, handleShowContactInfoToggle); };

  const deleteChat = () => {
    handleChatStatus("delete", chat, user, dispatch, handleShowContactInfoToggle);

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

        { chat.currentChat.contact.uid && (<div className={ styles.contactNav } onClick={ handleShowContactInfoToggle } >
          <div className={ showContact ? styles.contactPicBG : styles.contactPic }>
            <img className={ styles.contactPicImg } src={ showContact ? userIcon : chat.currentChat.contact.profilePic } alt="Profile" />
          </div>
          <div >{ chat.currentChat.contact.email }</div>
        </div>)
        }
      </div>

      { showSettings && <BasicModal
        handleToggleModal={ handleShowSettingsToggle }
        fullscreen={ true }
        transparent={ true }
      >
        <UserSettingsModal />

      </BasicModal> }

      { chat.showChatInfo && <BasicModal
        handleToggleModal={ handleShowContactInfoToggle }
        fullscreen={ true }
        transparent={ true }
      >
        <ContactInfo handleBlockUser={ blockUser }
          handleDeleteChat={ deleteChat } />

      </BasicModal> }
    </div>
  );
};

export default Nav;