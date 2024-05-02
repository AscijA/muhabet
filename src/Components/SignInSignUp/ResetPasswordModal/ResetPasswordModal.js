import React, { useState } from 'react';
import styles from "./ResetPasswordModal.module.css";
import formStyles from "./../LoginForm/LoginForm.module.css";
import CustomInput from '../../Common/CustomInput/CustomInput';

export default function ResetPasswordModal(props) {

  return (
    <div className={ styles.outerContainer }>
      <form className={ styles.signForm }>
        <CustomInput
          label="Email address"
          inputType="text"
          stateElement={ props.email }
          stateElementChangeHandler={ props.handleChangeEmail }
        />

      </form>
    </div>
  );
}
