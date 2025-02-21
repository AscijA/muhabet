import React, { useEffect, useState } from 'react';
import styles from './Nav.module.scss';

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { storage, auth } from "../../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';

import { updateUser } from '../../store/userSlice';
import { toggleShowChatInfo, updateContact, setShowDefaultImage } from '../../store/chatSlice';
import { userSetUp, handleChatStatus } from '../../Helpers/DataHandling';
import userIcon from "../../assets/user.svg";

import UserSettingsModal from '../UserSettingsModal/UserSettingsModal';
import BasicModal from '../Common/BasicModal/BasicModal';
import SettingsItem from '../Common/SettingsItem/SettingsItem';
import ConfirmationWindow from '../Common/ConfirmationWindow/ConfirmationWindow';

const ContactInfo = (props) => {

  let user = useSelector((state) => state.user);
  let chat = useSelector((state) => state.chat);

  let chatStatusBlock = user.uid === chat.currentChat.user1ID ? chat.currentChat.chatStatus.user2Block : chat.currentChat.chatStatus.user1Block;

  let text = chatStatusBlock ? "Unblock User" : "Block User";
  let confirmTextTitle = chatStatusBlock ? "Are you sure you want to unblock this user?" : "Are you sure you want to block this user?";
  const [showConfirmWindowDeleteChat, setDisplayConfirmDeleteChat] = useState(false);
  const [showConfirmWindowBlockUser, setDisplayConfirmBlockUser] = useState(false);

  const handleShowConfirmationWindowDeleteChat = () => {
    setDisplayConfirmDeleteChat(oldState => !oldState);
  };
  const handleShowConfirmationWindowBlockUser = () => {
    setDisplayConfirmBlockUser(oldState => !oldState);
  };

  return (
    <>
      <div className={ styles.contactInfo }>
        <SettingsItem title="Delete Chat" onClick={ handleShowConfirmationWindowDeleteChat } />
        <SettingsItem title={ text } onClick={ handleShowConfirmationWindowBlockUser } />
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
            { text: "No", onClick: handleShowConfirmationWindowDeleteChat }
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
            { text: "No", onClick: handleShowConfirmationWindowBlockUser }
          ] }
          handleToggleModal={ handleShowConfirmationWindowBlockUser }
        />) }
    </>
  );
};

/**
 * Navbar
 */
const Nav = () => {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  let user = useSelector((state) => state.user);
  let chat = useSelector((state) => state.chat);
  const showDefaultImage = useSelector((state) => state.chat.showDefaultImage);

  const [showSettings, setShowSettings] = useState(false);
  const [showContact, setShowContact] = useState(false);

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
          setShowContact(true);
        })
        .catch((error) => {
          setShowContact(false);
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
        <ContactInfo handleBlockUser={ () => { handleChatStatus("block", chat, user, dispatch, handleShowContactInfoToggle); } }
          handleDeleteChat={ () => { handleChatStatus("delete", chat, user, dispatch, handleShowContactInfoToggle); } } />

      </BasicModal> }
    </div>
  );
};

export default Nav;