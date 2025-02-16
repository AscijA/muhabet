import styles from './SignComponent.module.scss';
// Import the functions you need from the SDKs you need
import { onAuthStateChanged, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from '../../Firebase/firebase';
import { AuthErrorCodes } from "firebase/auth";

import LoginForm from './LoginForm/LoginForm';
import BasicModal from '../Common/BasicModal/BasicModal';
import ResetPasswordModal from './ResetPasswordModal/ResetPasswordModal';
import logo from "../../assets/logo_white.svg";
import SideBar from '../Common/SideBar/SideBar';

import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { userSetUp, fetchChats } from '../../Helpers/DataLoading';


// import { LoadingOverlay } from '../Common/LoadingOverlay/LoadingOverlay';

/**
 * SignComponent is the main component for the sign in and sign up page.
 */
const SignComponent = () => {
  let [credentials, setCredentials] = useState({ email: "", password: "", });
  let [isSignIn, setIsSignIn] = useState(true);
  let [showResetModal, setShowResetModal] = useState(false);
  let [showError, setShowError] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");
  let [resetEmail, setResetEmail] = useState("");

  const dispatch = useDispatch();
  let navigate = useNavigate();

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userSetUp(user, dispatch);
        fetchChats(user.uid, dispatch);

        navigate("/chat");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch, navigate]);

  const handleChangeEmail = (event) => {
    setCredentials(oldState => {
      return { ...oldState, email: event.target.value };
    });
    setShowError(false);
  };

  const handleChangePassword = (event) => {
    setCredentials(oldState => {
      return { ...oldState, password: event.target.value };
    });
    setShowError(false);
  };

  const handleChangeResetEmail = (event) => {
    setResetEmail(event.target.value);
    setShowError(false);
  };

  const handleSignUp = (event) => {
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
  };
  const handleSignIn = (event) => {
    event.preventDefault();
    if (credentials.email && credentials.password) {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          signInWithEmailAndPassword(auth, credentials.email, credentials.password)
            .then((userCredential) => {
              userSetUp(auth.currentUser, dispatch);
              navigate("/chat");

            })
            .catch((error) => {
              setShowError(true);
              setErrorMessage("Invalid Credentials");
            });
        });
    }
    else {
      setShowError(true);
      setErrorMessage("Email and/or password cannot be empty");
    }
  };

  const handleResetPassword = (event) => {
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
  };
  const handleChangeFormType = () => {
    setIsSignIn(oldState => !oldState);
  }

  const handleResetPasswordToggle = () => {
    setShowResetModal(oldState => !oldState);
  }

  return (
    <div className={ styles.main }>
      <SideBar isChat={ false }>
        <div className={ styles.logoContainer } >
          <img src={ logo } alt="Logo" className={ styles.logo } />
        </div>
        <div className={ styles.formContainer }>
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
        </div>
        { showResetModal && <BasicModal
          handleToggleModal={ handleResetPasswordToggle }
          fullscreen={ true }
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
};

export default SignComponent;

