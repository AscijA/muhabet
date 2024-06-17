import React from 'react';
import styles from './Nav.module.css';
import { useSelector } from 'react-redux';


function Nav() {
  let user = useSelector((state) => {
    // console.log(state.user);
    return state.user;
  });

  return (
    <div className={ styles.main }>
      <div className={ styles.side }>
        <div className={ styles.userName } >{ user.email }</div>
        <div className={ styles.settingsButton }>Settings</div>

      </div>
      <div className={ styles.chatContent }>{ 1 }</div>
    </div>
  );
}

export default Nav;