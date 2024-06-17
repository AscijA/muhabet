import React from 'react';
import styles from './Nav.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../../store/userSlice';


function Nav() {
  let user = useSelector((state) => {
    // console.log(state.user);
    return state.user;
  });

  const dispatch = useDispatch();
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