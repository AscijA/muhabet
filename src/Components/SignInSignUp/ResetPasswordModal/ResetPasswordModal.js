import React from 'react';
import styles from "./ResetPasswordModal.module.scss";

import CustomInput from '../../Common/CustomInput/CustomInput';
import CustomButton from '../../Common/Buttons/CustomButton';

/**
 * ResetPasswordModal component component for the password reset form. Used inside a BaseModal
 * @param {string} stateElement - The email address that is entered by the user.
 * @param {function} stateElementChangeHandler - The function to be called when the email address input field value changes.
 * @param {boolean} showError - A boolean to determine if an error message should be shown or not.
 * @param {string} errorMessage - The error message to be shown.
 * @param {function} handleResetPassword - The function to be called when the user clicks the "Reset password" button.
 */
const ResetPasswordModal = (props) => {

  return (
    <div className={ styles.outerContainer }>
      <div>After submitting, if a user exists, You will recieve an email with password reset link</div>
      <form className={ styles.signForm }>
        <CustomInput
          label="Email address"
          inputType="email"
          stateElement={ props.stateElement }
          stateElementChangeHandler={ props.stateElementChangeHandler }
        />
        { props.showError && <div> { props.errorMessage }</div> }
        <CustomButton
          buttonType="outlined"
          buttonText="Reset password"
          handleSubmit={ props.handleResetPassword }
        />
      </form >
    </div >
  );
}

export default ResetPasswordModal;