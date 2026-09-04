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
        <div onClick={ props.handleChangeFormType }>{ props.formType }</div>
        <div onClick={ props.handleResetPasswordToggle }>Reset password</div>
      </div>
    </form>
  );
}

export default LoginForm;