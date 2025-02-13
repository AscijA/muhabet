import React, { useEffect, useState } from 'react';
import styles from './Nav.module.scss';
import { UserSettingsModal } from '../UserSettingsModal/UserSettingsModal';
import { useSelector } from 'react-redux';
import BasicModal from '../Common/BasicModal/BasicModal';
import { useDispatch } from 'react-redux';
import { toggleShowChatInfo, updateContact } from '../../store/chatSlice';
import { storage, auth } from "../../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { updateUser } from '../../store/userSlice';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [showUser, setShowUser] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userSetUp(user, dispatch);
        // Update with chat user icon
        if(chat.currentChat.contact.uid !== undefined) 
        {const contactRef = ref(storage, `profile-pics/${chat.currentChat.contact.uid}`);
        getDownloadURL(contactRef).then((url) => {
          dispatch(updateContact({ profilePic: url }));
          setShowContact(true);
        });}

        const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
        getDownloadURL(gsRef).then((url) => {
          dispatch(updateUser({ profilePic: url }));
          setShowUser(true);
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [chat.currentChat.contact.uid, dispatch]);


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
          <div className={ showUser ? styles.contactPic : styles.contactPicBG }>
            <img className={ styles.contactPicImg } src={ showUser ? user.profilePic : userIcon } alt="Profile" />
          </div>
          <div className={ styles.userName } >{ user.email }</div>
        </div>
        <div className={ styles.settingsButton } onClick={ handleShowSettingsToggle }><span>Settings</span></div>
      </div>
      <div className={ styles.chatContent }>

       { chat.currentChat.contact.uid !== undefined && ( <div className={ styles.contactNav } onClick={ handleShowContactInfoToggle } >
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