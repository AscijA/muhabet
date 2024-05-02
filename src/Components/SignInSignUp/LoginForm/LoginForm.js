import React from 'react';
import styles from './LoginForm.module.css';
import CustomInput from '../../Common/CustomInput/CustomInput';

function LoginForm(props) {
  return (
    <form className={ styles.signForm }>
      <CustomInput
        label="Email address"
        inputType="text"
        stateElement={ props.email }
        stateElementChangeHandler={ props.handleChangeEmail }
      />
      <CustomInput
        label="Password"
        inputType="password"
        stateElement={ props.password }
        stateElementChangeHandler={ props.handleChangePassword }
      />
      <div className={ styles.buttonContainer }>
        <button onClick={ props.handleSubmit }>{ props.buttonText }</button>
      </div>
      <div className={ styles.helpLinks }>
        <div onClick={ props.handleChangeFormType }>{ props.formType }</div>
        <div onClick={ props.handleResetPasswordToggle }>Reset password</div>
      </div>
    </form>
  );
}

export default LoginForm;