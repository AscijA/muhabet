import React, { useEffect, useRef } from 'react';
import styles from "./UserSettingsModal.module.scss";
import { useDispatch, useSelector } from 'react-redux';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { auth, storage } from '../../Firebase/firebase';
import { resetUser, updateUser } from '../../store/userSlice';
import { setShowDefaultImage } from '../../store/chatSlice';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';
import userIcon from "../../assets/user.svg";
import SettingsItem from '../Common/SettingsItem/SettingsItem';

/**
 * UserSettingsModal component that displays the user profile picture and email address.
 * Also allows the user to log out, delete their account or change profile picture. 
 */
export const UserSettingsModal = (props) => {
  let user = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const showDefaultImage = useSelector((state) => state.chat.showDefaultImage);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  return (
    <div className={ styles.outerContainer }>
      <div className={ styles.profileContainer + (showDefaultImage ? " " + styles.noProfileBG : "") }>
        <input
          type="file"
          accept="image/*"
          onChange={ handleFileChange }
          ref={ fileInputRef }
          style={ { display: 'none' } }
        />
        <img src={ !showDefaultImage ? user.profilePic : userIcon } alt="Profile" className={ styles.profilePic } onClick={ handleChooseFileClick } />
      </div>
      <div className={ styles.email }>
        { user.email }
      </div>
      <div className={ styles.buttonsContainer }>
        <SettingsItem title="Log Out" onClick={ handleSignOut } />
        <SettingsItem title="Remove Profile Image" onClick={ handleDeleteProfileImage } />
        <SettingsItem title="Delete Account" onClick={ handleDeleteUser } color="red"/>

      </div>

    </div>
  );
};
