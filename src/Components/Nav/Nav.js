import React, { useEffect, useState } from 'react';
import styles from './Nav.module.scss';

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { UserSettingsModal } from '../UserSettingsModal/UserSettingsModal';
import BasicModal from '../Common/BasicModal/BasicModal';

import { storage, auth } from "../../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';

import { updateUser } from '../../store/userSlice';
import { toggleShowChatInfo, updateContact, setShowDefaultImage } from '../../store/chatSlice';

import { userSetUp } from '../../Helpers/DataLoading';
import userIcon from "../../assets/user.svg";

/**
 * Navbar
 */
function Nav() {
  let user = useSelector((state) => state.user);
  let chat = useSelector((state) => state.chat);
  const [showSettings, setShowSettings] = useState(false);
  const dispatch = useDispatch();
  const showDefaultImage = useSelector((state) => state.chat.showDefaultImage);
  const [showContact, setShowContact] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userSetUp(user, dispatch);
        // Update with chat user icon
        if (chat.currentChat.contact.uid !== undefined) {
          const contactRef = ref(storage, `profile-pics/${chat.currentChat.contact.uid}`);
          getDownloadURL(contactRef).then((url) => {
            dispatch(updateContact({ profilePic: url }));
            setShowContact(true);
          }).catch((error) => {
            setShowContact(false);
          });
        }

        const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
        getDownloadURL(gsRef).then((url) => {
          dispatch(updateUser({ profilePic: url }));
          dispatch(setShowDefaultImage(false));
        }).catch((error) => {

        });

      }
      else {
        navigate("/");

      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [chat.currentChat.contact.uid, dispatch, navigate]);


  function handleShowSettingsToggle() {
    setShowSettings(oldState => !oldState);
  }

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

        { chat.currentChat.contact.uid !== undefined && (<div className={ styles.contactNav } onClick={ handleShowContactInfoToggle } >
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

      </BasicModal> }
    </div>
  );
}

export default Nav;