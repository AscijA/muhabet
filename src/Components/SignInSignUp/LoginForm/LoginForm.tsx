import React from 'react';
import styles from './LoginForm.module.scss';
import CustomInput from '../../Common/CustomInput/CustomInput';
import CustomButton from '../../Common/Buttons/CustomButton';

interface LoginFormProps {
  handleResetPasswordToggle: () => void;
  handleChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangePassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeFormType: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  formType: string;
  showError: boolean;
  errorMessage: string;
  buttonText: string;
  email: string;
  password?: string;
}

const LoginForm: React.FC<LoginFormProps> = (props) => {
  return (
    <form className={ styles.signForm }>
      <div className={ styles.intro }>
        <h1>{ props.buttonText === "Sign in" ? "Welcome back." : "Start a conversation." }</h1>
        <p>{ props.buttonText === "Sign in" ? "Sign in to pick up where you left off." : "Create your account and say hello." }</p>
      </div>
      <CustomInput
        label="Email address"
        inputType="email"
        stateElement={ props.email }
        stateElementChangeHandler={ props.handleChangeEmail }
      />
      <CustomInput
        label="Password"
        inputType="password"
        stateElement={ props.password || "" }
        stateElementChangeHandler={ props.handleChangePassword }
      />
      {props.showError && <div className={styles.errorMessage}>{props.errorMessage}</div>}
      <CustomButton
        buttonType="filled"
        buttonText={ props.buttonText }
        handleSubmit={ () => props.handleSubmit({ preventDefault: () => {} } as React.FormEvent) }
      />
      <div className={ styles.helpLinks }>
        <button type="button" onClick={ props.handleChangeFormType }>{ props.formType }</button>
        <button type="button" onClick={ props.handleResetPasswordToggle }>Reset password</button>
      </div>
    </form>
  );
}

export default LoginForm;
