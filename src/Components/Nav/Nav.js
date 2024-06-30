import React, { useState } from 'react';
import styles from './Nav.module.scss';
import { useSelector } from 'react-redux';
import BasicModal from '../Common/BasicModal/BasicModal';
import { UserSettingsModal } from '../UserSettingsModal/UserSettingsModal';


function Nav() {
  let user = useSelector((state) => {
    // console.log(state.user);
    return state.user;
  });

  const [showSettings, setShowSettings] = useState(false);


  function handleShowSettingsToggle() {
    setShowSettings(oldState => !oldState);
  }
  return (
    <div className={ styles.main }>
      <div className={ styles.side }>
        <div className={ styles.userName } >{ user.email }</div>
        <div className={ styles.settingsButton } onClick={ handleShowSettingsToggle }><span>Settings</span></div>
        { showSettings && <BasicModal
          handleToggleModal={ handleShowSettingsToggle }
          fullscreen={ true }
          transparent={ true }
        >
          <UserSettingsModal />

        </BasicModal> }
      </div>
      <div className={ styles.chatContent }>
          
          <div>
            <div>
              <img src="" alt="" />
            </div>
            <div></div>
          </div>

      </div>
    </div>
  );
}

export default Nav;