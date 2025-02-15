import React, { useEffect, useRef, useState } from 'react';
import styles from "./UserSettingsModal.module.scss";
import CustomButton from '../Common/Buttons/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, storage } from '../../Firebase/firebase';
import { resetUser, updateUser } from '../../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';
import userIcon from "../../assets/user.svg";

/**
 * UserSettingsModal component that displays the user profile picture and email address.
 * Also allows the user to log out, delete their account or change profile picture. 
 */
export const UserSettingsModal = (props) => {
  let user = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const [showUser, setShowUser] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
    getDownloadURL(gsRef).then((url) => {
      dispatch(updateUser({ profilePic: url }));
      setShowUser(true);
    }).catch((error) => { });

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);

    uploadBytes(storageRef, file).then((snapshot) => {
      getDownloadURL(storageRef).then((url) => {
        dispatch(updateUser({ profilePic: url }));
      });
    });
  };
  return (
    <div className={ styles.outerContainer }>
      <div className={ styles.profileContainer + (!showUser ? " " + styles.noProfileBG : "") }>
        <input
          type="file"
          accept="image/*"
          onChange={ handleFileChange }
          ref={ fileInputRef }
          style={ { display: 'none' } }
        />
        <img src={ showUser ? user.profilePic : userIcon } alt="Profile" className={ styles.profilePic } onClick={ handleChooseFileClick } />
      </div>
      <div className={ styles.email }>
        { user.email }
      </div>
      <div className={ styles.buttonsContainer }>
        <CustomButton handleSubmit={ handleSignOut } buttonText="Log Out" buttonSize="sm" />
        <CustomButton handleSubmit={ handleDeleteUser } buttonText="Delete Account" buttonSize="sm" />
      </div>

    </div>
  );
};
