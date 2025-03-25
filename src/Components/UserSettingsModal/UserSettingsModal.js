import React, { useEffect, useRef, useState } from 'react';
import styles from "./UserSettingsModal.module.scss";

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { removeUserProfileImage, deleteUserAccount, getUserProfileImage, signOutUser, uploadProfileImage } from 'src/Helpers/UserUtils';
import { resetChatState, setShowDefaultImage } from '../../store/chatSlice';
import { resetUser, updateUser } from '../../store/userSlice';

import userIcon from "../../assets/user.svg";

import ConfirmationWindow from '../Common/ConfirmationWindow/ConfirmationWindow';
import SettingsItem from '../Common/SettingsItem/SettingsItem';

/**
 * UserSettingsModal component that displays the user profile picture and email address.
 * Also allows the user to log out, delete their account or change profile picture. 
 */
const UserSettingsModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  let currentUser = useSelector((state) => state.user);
  const showDefaultImage = useSelector((state) => state.chat.showDefaultImage);

  const [showConfirmWindowLogOut, setDisplayConfirmLogOut] = useState(false);
  const [showConfirmWindowDeleteImage, setDisplayConfirmDeleteImage] = useState(false);
  const [showConfirmWindowDeleteAcc, setDisplayConfirmDeleteAcc] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    getUserProfileImage(dispatch, updateUser, setShowDefaultImage);
  }, [dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadProfileImage(file, dispatch, updateUser, setShowDefaultImage);
  };

  return (
    <>
      <div className={ styles.outerContainer }>
        <div className={ styles.profileContainer + (showDefaultImage ? " " + styles.noProfileBG : "") }>
          <input
            type="file"
            accept="image/*"
            onChange={ handleFileChange }
            ref={ fileInputRef }
            style={ { display: 'none' } }
          />
          <img src={ !showDefaultImage ? currentUser.profilePic : userIcon } alt="Profile" className={ styles.profilePic } onClick={ () => fileInputRef.current.click() } />
        </div>
        <div className={ styles.email }>
          { currentUser.email }
        </div>
        <div className={ styles.buttonsContainer }>
          <SettingsItem title="Log Out" onClick={() => setDisplayConfirmLogOut(true)} />
          <SettingsItem title="Remove Profile Image" onClick={() => setDisplayConfirmDeleteImage(true)} />
          <SettingsItem title="Delete Account" onClick={() => setDisplayConfirmDeleteAcc(true)} color="red" />
        </div>
      </div>

      { showConfirmWindowLogOut &&
        (<ConfirmationWindow
          text="Are you sure you want to Log Out?"
          buttons={[
            { text: "Yes", onClick: () => signOutUser(dispatch, resetUser, resetChatState, navigate) },
            { text: "No", onClick: () => setDisplayConfirmLogOut(false) }
          ]}
          handleToggleModal={() => setDisplayConfirmLogOut(false)}
        />) }

      { showConfirmWindowDeleteImage &&
        (<ConfirmationWindow
          text="Are you sure you want to remove Your profile picture?"
          buttons={[
            { text: "Yes", onClick: () => removeUserProfileImage(dispatch, updateUser, setShowDefaultImage) },
            { text: "No", onClick: () => setDisplayConfirmDeleteImage(false) }
          ]}
          handleToggleModal={() => setDisplayConfirmDeleteImage(false)}
        />) }

      { showConfirmWindowDeleteAcc &&
        (<ConfirmationWindow
          text="Are you sure you want to Delete Your Account? This action cannot be undone."
          buttons={[
            { text: "Yes", onClick: () => deleteUserAccount(dispatch, resetUser, navigate) },
            { text: "No", onClick: () => setDisplayConfirmDeleteAcc(false) }
          ]}
          handleToggleModal={() => setDisplayConfirmDeleteAcc(false)}
        />) }
    </>
  );
};

export default UserSettingsModal;