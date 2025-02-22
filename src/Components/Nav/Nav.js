import React, { useEffect, useState } from 'react';
import styles from './Nav.module.scss';

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { storage, auth } from "../../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';

import { updateUser } from '../../store/userSlice';
import { toggleShowChatInfo, updateContact, setShowDefaultImage, setShowContactDefaultImage } from '../../store/chatSlice';

import { userSetUp, handleChatStatus } from '../../Helpers/DataHandling';

import userIcon from "../../assets/user.svg";

import UserSettingsModal from '../UserSettingsModal/UserSettingsModal';
import BasicModal from '../Common/BasicModal/BasicModal';
import ContactInfo from './ContactInfoModal/ContactInfoModal';
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
        userSetUp(user, dispatch);

        const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
        getDownloadURL(gsRef)
          .then((url) => {
            dispatch(updateUser({ profilePic: url }));
            dispatch(setShowDefaultImage(false));
          })
          .catch((error) => {
            console.error("Error fetching user profile pic:", error);
          });
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (chat.currentChat?.contact?.uid) {
      const contactRef = ref(storage, `profile-pics/${chat.currentChat.contact.uid}`);

      getDownloadURL(contactRef)
        .then((url) => {
          dispatch(updateContact({ profilePic: url }));
          dispatch(setShowContactDefaultImage(true));
        })
        .catch((error) => {
          dispatch(setShowContactDefaultImage(false));
          console.error("Error fetching contact profile pic:", error);
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
          <div className={ !showDefaultImage ? styles.contactPic : styles.contactPicBG }>
            <img className={ styles.contactPicImg } src={ !showDefaultImage ? user.profilePic : userIcon } alt="Profile" />
          </div>
          <div className={ styles.userName } >{ user.email }</div>
        </div>
        <div className={ styles.settingsButton } onClick={ handleShowSettingsToggle }><span>Settings</span></div>
      </div>
      <div className={ styles.chatContent }>

        { chat.currentChat.contact.uid && (<div className={ styles.contactNav } onClick={ handleShowContactInfoToggle } >
          <div className={ showContact ? styles.contactPic : styles.contactPicBG }>
            <img className={ styles.contactPicImg } src={ showContact ? chat.currentChat.contact.profilePic : userIcon } alt="Profile" />
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