import React, { useState, useEffect } from "react";
import styles from './SignComponent.module.scss';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInUser, signUpUser, resetUserPassword, subscribeToAuthChangesOnLogin } from 'src/Helpers/AuthUtils';
import logo from "../../assets/logo_white.svg";
import ResetPasswordModal from './ResetPasswordModal/ResetPasswordModal';
import BasicModal from '../Common/BasicModal/BasicModal';
import SideBar from '../Common/SideBar/SideBar';
import LoginForm from './LoginForm/LoginForm';
import { AppDispatch } from "src/store/store";

const SignComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  let navigate = useNavigate();

  let [credentials, setCredentials] = useState({ email: "", password: "" });
  let [isSignIn, setIsSignIn] = useState(true);
  let [showResetModal, setShowResetModal] = useState(false);
  let [showError, setShowError] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");
  let [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuthChangesOnLogin(dispatch, navigate);
    return () => unsubscribe();
  }, [dispatch, navigate]);

  const handleChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    setShowError(false);
  };

  const handleChangeResetEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(event.target.value);
    setShowError(false);
  };

  const handleSignUp = (event: React.FormEvent) => {
    event.preventDefault();
    signUpUser(credentials.email, credentials.password, setErrorMessage, setShowError);
  };

  const handleSignIn = (event: React.FormEvent) => {
    event.preventDefault();
    signInUser(credentials.email, credentials.password, dispatch, navigate, setErrorMessage, setShowError);
  };

  const handleResetPassword = (event: React.FormEvent) => {
    event.preventDefault();
    resetUserPassword(resetEmail, setShowResetModal, setErrorMessage, setShowError);
  };

  const handleChangeFormType = () => {
    setIsSignIn((prev) => !prev);
  };

  const handleResetPasswordToggle = () => {
    setShowResetModal((prev) => !prev);
  };

  return (
    <div className={ styles.main }>
      <SideBar isChat={ false }>
        <div className={ styles.logoContainer }>
          <img src={ logo } alt="Logo" className={ styles.logo } />
        </div>
        <div className={ styles.formContainer }>
          <LoginForm
            handleChangeEmail={ (e) => handleChange("email", e.target.value) }
            handleChangePassword={ (e) => handleChange("password", e.target.value) }
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
        { showResetModal &&
          <BasicModal handleToggleModal={ handleResetPasswordToggle } fullscreen={ true }>
            <ResetPasswordModal
              handleResetPassword={ handleResetPassword }
              stateElement={ resetEmail }
              stateElementChangeHandler={ handleChangeResetEmail }
              showError={ showError }
              errorMessage={ errorMessage }
            />
          </BasicModal>
        }
      </SideBar>
      <div className={ styles.imageContainer }></div>
    </div>
  );
};

export default SignComponent;
