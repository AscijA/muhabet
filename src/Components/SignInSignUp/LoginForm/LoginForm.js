import React from 'react';
import styles from './LoginForm.module.css';
import CustomInput from '../../Common/CustomInput/CustomInput';
import CustomButton from '../../Common/Buttons/CustomButton';

function LoginForm(props) {
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