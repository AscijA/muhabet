import React from 'react';
import styles from './LoginForm.module.scss';
import CustomInput from '../../Common/CustomInput/CustomInput';
import CustomButton from '../../Common/Buttons/CustomButton';

/**
 * LoginForm component is a re-usable component for login forms.
 * @param {string} formType - The type of the form, can be "Sign up" or "Sign in".
 * @param {string} buttonText - The text displayed in the button.
 * @param {boolean} showError - A boolean to show or hide the error message.
 * @param {string} errorMessage - The error message to be displayed.
 * @param {string} email - The email address field in the form.
 * @param {function} handleChangeEmail - The function to be called when the email address field value changes.
 * @param {string} password - The password field in the form.
 * @param {function} handleChangePassword - The function to be called when the password field value changes.
 * @param {function} handleSubmit - The function to be called when the button is clicked.
 * @param {function} handleChangeFormType - The function to be called when the form type is changed.
 * @param {function} handleResetPasswordToggle - The function to be called when the reset password link is clicked.
 */
const LoginForm = (props) => {
  return (
    <form className={ styles.signForm }>
      <CustomInput
        label="Email address"
        inputType="email"
        stateElement={ props.email }
        stateElementChangeHandler={ props.handleChangeEmail }
      />
      <CustomInput
        label="Password"
        inputType="password"
        stateElement={ props.password }
        stateElementChangeHandler={ props.handleChangePassword }
      />
      {props.showError && <div className={styles.errorMessage}>{props.errorMessage}</div>}
      <CustomButton
        buttonType="filled"
        buttonText={ props.buttonText }
        handleSubmit={ props.handleSubmit }
      />
      <div className={ styles.helpLinks }>
        <div onClick={ props.handleChangeFormType }>{ props.formType }</div>
        <div onClick={ props.handleResetPasswordToggle }>Reset password</div>
      </div>
    </form>
  );
}

export default LoginForm;