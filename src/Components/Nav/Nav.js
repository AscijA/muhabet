import React, { useEffect, useState } from 'react';
import styles from './Nav.module.scss';
import { UserSettingsModal } from '../UserSettingsModal/UserSettingsModal';
import { useSelector } from 'react-redux';
import BasicModal from '../Common/BasicModal/BasicModal';
import { useDispatch } from 'react-redux';
import { toggleShowChatInfo, updateContact } from '../../store/chatSlice';
import { storage, bucket } from "../../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";

function Nav() {
  let user = useSelector((state) => state.user);
  let chat = useSelector((state) => state.chat);
  const [showSettings, setShowSettings] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const gsRef = ref(storage, `gs://${bucket}/profile-pics/kindpng_6534564.png`);
    getDownloadURL(gsRef).then((url) => {
      dispatch(updateContact({ profilePic: url }));
    });

  }, [dispatch]);

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
          <img className={ styles.contactPicImg } src={ chat.currentChat.contact.profilePic } alt="" />
          <div className={ styles.userName } >{ user.email }</div>
        </div>
        <div className={ styles.settingsButton } onClick={ handleShowSettingsToggle }><span>Settings</span></div>
      </div>
      <div className={ styles.chatContent }>

        <div className={ styles.contactNav } onClick={ handleShowContactInfoToggle } >
          <div className={ chat.currentChat.contact.profilePic === "" ? styles.contactPic : "" }>
            <img className={ styles.contactPicImg } src={ chat.currentChat.contact.profilePic } alt="" />
          </div>
          <div >{ chat.currentChat.contact.email }</div>
        </div>

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