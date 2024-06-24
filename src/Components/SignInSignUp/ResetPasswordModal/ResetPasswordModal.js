import React from 'react';
import styles from "./ResetPasswordModal.module.scss";
import CustomInput from '../../Common/CustomInput/CustomInput';
import CustomButton from '../../Common/Buttons/CustomButton';

export default function ResetPasswordModal(props) {

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
