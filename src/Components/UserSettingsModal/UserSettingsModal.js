import React, { useEffect, useRef, useState } from 'react';
import styles from "./UserSettingsModal.module.scss";

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { auth, storage } from '../../Firebase/firebase';

import { resetUser, updateUser } from '../../store/userSlice';
import { resetChatState, setShowDefaultImage } from '../../store/chatSlice';
import { deleteUser } from 'firebase/auth';

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
    const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    getDownloadURL(gsRef).then((url) => {
      dispatch(updateUser({ profilePic: url }));
      dispatch(setShowDefaultImage(false));
    }).catch((error) => {
      dispatch(setShowDefaultImage(true));
    });
  }, [dispatch]);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      dispatch(resetUser());
      dispatch(resetChatState());
      navigate("/");
    });
  };

  const handleDeleteUser = () => {
    deleteUser(auth.currentUser)
      .then(() => {
        dispatch(resetUser());
        navigate("/");
      });
  };

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  const handleDeleteProfileImage = () => {
    const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    deleteObject(storageRef).then(() => {
      dispatch(updateUser({ profilePic: "" }));
      dispatch(setShowDefaultImage(true));
    }).catch((error) => {
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    uploadBytes(storageRef, file).then((snapshot) => {
      getDownloadURL(storageRef).then((url) => {
        dispatch(updateUser({ profilePic: url }));
        dispatch(setShowDefaultImage(false));
      });
    });
  };

  const handleShowConfirmationWindowLogOut = () => {
    setDisplayConfirmLogOut(oldState => !oldState);
  };

  const handleShowConfirmationWindowDeleteImage = () => {
    setDisplayConfirmDeleteImage(oldState => !oldState);
  };

  const handleShowConfirmationWindowDeleteUser = () => {
    setDisplayConfirmDeleteAcc(oldState => !oldState);
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
          <img src={ !showDefaultImage ? currentUser.profilePic : userIcon } alt="Profile" className={ styles.profilePic } onClick={ handleChooseFileClick } />
        </div>
        <div className={ styles.email }>
          { currentUser.email }
        </div>
        <div className={ styles.buttonsContainer }>
          <SettingsItem
            title="Log Out"
            onClick={ handleShowConfirmationWindowLogOut } />
          <SettingsItem
            title="Remove Profile Image"
            onClick={ handleShowConfirmationWindowDeleteImage } />
          <SettingsItem
            title="Delete Account"
            onClick={ handleShowConfirmationWindowDeleteUser }
            color="red" />
        </div>
      </div>

      { showConfirmWindowLogOut &&
        (<ConfirmationWindow
          text="Are you sure you want to Log Out?"
          buttons={ [
            { text: "Yes", onClick: handleSignOut },
            { text: "No", onClick: handleShowConfirmationWindowLogOut }
          ] }
          handleToggleModal={ handleShowConfirmationWindowLogOut }
        />) }

      { showConfirmWindowDeleteImage &&
        (<ConfirmationWindow
          text="Are you sure you want to remove Your profile picture?"
          buttons={ [
            { text: "Yes", onClick: handleDeleteProfileImage },
            { text: "No", onClick: handleShowConfirmationWindowDeleteImage }
          ] }
          handleToggleModal={ handleShowConfirmationWindowDeleteImage }
        />) }

      { showConfirmWindowDeleteAcc &&
        (<ConfirmationWindow
          text="Are you sure you want to Delete Your Account? This action cannot be undone."
          buttons={ [
            { text: "Yes", onClick: handleDeleteUser },
            { text: "No", onClick: handleShowConfirmationWindowDeleteUser }
          ] }
          handleToggleModal={ handleShowConfirmationWindowDeleteUser }
        />) }
    </>
  );
};


export default UserSettingsModal;