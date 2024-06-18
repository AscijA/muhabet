import styles from './SignComponent.module.css';
// Import the functions you need from the SDKs you need
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from '../../Firebase/firebase';
import { AuthErrorCodes } from "firebase/auth";

import LoginForm from './LoginForm/LoginForm';
import BasicModal from '../Common/BasicModal/BasicModal';
import ResetPasswordModal from './ResetPasswordModal/ResetPasswordModal';
import logo from "../../assets/logo_white.svg";
import SideBar from '../Common/SideBar/SideBar';

import { useNavigate } from 'react-router-dom';

import { useState, } from "react";
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';


// import { LoadingOverlay } from '../Common/LoadingOverlay/LoadingOverlay';

function SignComponent() {
  let [credentials, setCredentials] = useState({ email: "", password: "", });
  let [isSignIn, setIsSignIn] = useState(true);
  let [showResetModal, setShowResetModal] = useState(false);
  let [showError, setShowError] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");
  let [resetEmail, setResetEmail] = useState("");

  const dispatch = useDispatch();
  let navigate = useNavigate();

  function handleChangeEmail(event) {
    setCredentials(oldState => {
      return { ...oldState, email: event.target.value };
    });
    setShowError(false);
  }

  function handleChangePassword(event) {
    setCredentials(oldState => {
      return { ...oldState, password: event.target.value };
    });
    setShowError(false);
  }

  function handleChangeResetEmail(event) {
    setResetEmail(event.target.value);
    setShowError(false);
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
          switch (error.code) {
            case AuthErrorCodes.WEAK_PASSWORD:
              setErrorMessage("Password has to be at least 6 characters long");
              break;
            case AuthErrorCodes.INVALID_EMAIL:
              setErrorMessage("Email is invalid");
              break;
            case AuthErrorCodes.EMAIL_EXISTS:
              setErrorMessage("Email is already in use");
              break;
            default:
              setErrorMessage("An Error Occured");
              break;
          }
          setShowError(true);
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
          // console.log(userInfo);
          dispatch(setUser({ ...user }));
          navigate("/chat");

        })
        .catch((error) => {
          setShowError(true);
          setErrorMessage("Invalid Credentials");
        });
    }
    else {
      setShowError(true);
      setErrorMessage("Email and/or password cannot be empty");
    }
  }

  function handleResetPassword(event) {
    event.preventDefault();
    if (resetEmail) {
      console.log(resetEmail);
      sendPasswordResetEmail(auth, resetEmail)
        .then((userCredential) => {
          console.log(userCredential);
          setShowResetModal(false);
        })
        .catch((error) => {
          console.log(error);
          switch (error.code) {
            case AuthErrorCodes.INVALID_EMAIL:
              setErrorMessage("Email is invalid");
              break;
            case AuthErrorCodes.USER_DELETED:
              setErrorMessage("Email/User not found");
              break;
            default:
              setErrorMessage("An Error Occured");
              break;
          }
          setShowError(true);
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
    <div className={ styles.main }>
      <SideBar isChat={ false }>
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
          errorMessage={ errorMessage }
          showError={ showError }
        />
        { showResetModal && <BasicModal
          handleResetPasswordToggle={ handleResetPasswordToggle }
        >
          <ResetPasswordModal
            handleResetPassword={ handleResetPassword }
            stateElement={ resetEmail }
            stateElementChangeHandler={ handleChangeResetEmail }
            showError={ showError }
            errorMessage={ errorMessage }
          />
        </BasicModal> }
      </SideBar>
      <div>
        Slika
      </div>
    </div>
  );
}

export default SignComponent;
