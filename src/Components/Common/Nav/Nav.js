import React from 'react';
import styles from './Nav.module.css';

function Nav() {
  return (
    <div className={ styles.main }>
      <div className={ styles.side }>
        <div className={ styles.userName }>User Name</div>
        <div className={ styles.settingsButton }>Settings</div>

      </div>
      <div className={ styles.chatContent }>a</div>
    </div>
  );
}

export default Nav;