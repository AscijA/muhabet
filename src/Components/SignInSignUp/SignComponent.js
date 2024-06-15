import styles from './SignComponent.module.css';
// Import the functions you need from the SDKs you need
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

import { useState, } from "react";
import { auth, db } from '../../Firebase/firebase';
import LoginForm from './LoginForm/LoginForm';
import BasicModal from '../Common/BasicModal/BasicModal';
import ResetPasswordModal from './ResetPasswordModal/ResetPasswordModal';
import logo from "../../assets/logo_white.svg";
import SideBar from '../Common/SideBar/SideBar';
// import { LoadingOverlay } from '../Common/LoadingOverlay/LoadingOverlay';

function SignComponent() {
  let [credentials, setCredentials] = useState({ email: "", password: "", });
  let [isSignIn, setIsSignIn] = useState(true);
  let [showResetModal, setShowResetModal] = useState(false);

  function handleChangeEmail(event) {
    setCredentials(oldState => {
      return { ...oldState, email: event.target.value };
    });
  }
  function handleChangePassword(event) {
    setCredentials(oldState => {
      return { ...oldState, password: event.target.value };
    });
  }
  function handleSignUp(event) {
    event.preventDefault();
    if (credentials.email && credentials.password) {
      createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
        .then(async (userCredential) => {
          const userInfo = userCredential.user;
          const user = {
            email: userInfo.email,
            displayName: userInfo.displayName,
            emailVerified: userInfo.emailVerified,
            createdAt: userInfo.metadata.creationTime,
            uid: userInfo.uid,
          };
          const docRef = await addDoc(collection(db, "users"), user);
          console.log(docRef);
        })
        .catch((error) => {
          // const errorCode = error.code;
          // const errorMessage = error.message;
        });
    }
  }
  function handleSignIn(event) {
    event.preventDefault();
    if (credentials.email && credentials.password) {
      signInWithEmailAndPassword(auth, credentials.email, credentials.password)
        .then((userCredential) => {
          const userInfo = userCredential.user;
          const user = {
            email: userInfo.email,
            displayName: userInfo.displayName,
            emailVerified: userInfo.emailVerified,
            createdAt: userInfo.metadata.creationTime,
            uid: userInfo.uid,

          };
          console.log(user);
        })
        .catch((error) => {
          // const errorCode = error.code;
          // const errorMessage = error.message;
        });
    }
  }
  function handleResetPassword(event) {
    event.preventDefault();
    if (credentials.email) {
      sendPasswordResetEmail(auth, credentials.email)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log(user);
        })
        .catch((error) => {
        });
    }
  }
  function handleChangeFormType() {
    setIsSignIn(oldState => !oldState);
  }

  function handleResetPasswordToggle() {
    setShowResetModal(oldState => !oldState);
  }

  return (
    <SideBar>
      <div className={ styles.logoContainer } >
        <img src={ logo } alt="Logo" className={ styles.logo } />
      </div>
      <LoginForm
        handleChangeEmail={ handleChangeEmail }
        handleChangePassword={ handleChangePassword }
        handleResetPasswordToggle={ handleResetPasswordToggle }
        handleChangeFormType={ handleChangeFormType }
        email={ credentials.email }
        password={ credentials.password }
        handleSubmit={ isSignIn ? handleSignIn : handleSignUp }
        buttonText={ isSignIn ? "Sign in" : "Sign up" }
        formType={ isSignIn ? "Account needed? Sign up" : "Already a user? Sign in" }
      />
      { showResetModal && <BasicModal
        handleResetPasswordToggle={ handleResetPasswordToggle }
      >
        <ResetPasswordModal
          handleResetPassword={ handleResetPassword }
          stateElement={ credentials.email }
          stateElementChangeHandler={ handleChangeEmail }

        />
      </BasicModal> }
    </SideBar>
  );
}

export default SignComponent;
