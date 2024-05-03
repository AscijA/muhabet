import React from 'react';
import styles from "./ResetPasswordModal.module.css";
import CustomInput from '../../Common/CustomInput/CustomInput';
import CustomButton from '../../Common/Buttons/CustomButton';

export default function ResetPasswordModal(props) {

  return (
    <div className={ styles.outerContainer }>
      <div>After submitting you will recieve an email with password reset link</div>
      <form className={ styles.signForm }>
        <CustomInput
          label="Email address"
          inputType="text"
          stateElement={ props.email }
          stateElementChangeHandler={ props.handleChangeEmail }
        />
        <CustomButton
          buttonType="outlined"
          buttonText="Reset password"
          handleSubmit={ props.handleResetPassword }
        />
      </form>
    </div>
  );
}
