import React from 'react';
import styles from './LoginForm.module.css';

function LoginForm(props) {
  return (
    <form className={styles.signForm}>
      <div className={ styles.formInput }>
        <label >Email address</label>
        <input type="text" value={ props.email } onChange={ props.handleChangeEmail } />
      </div>
      <div className={ styles.formInput }>
        <label >Password</label>
        <input type="password" value={ props.password } onChange={ props.handleChangePassword } />
      </div>
      <div className={styles.buttonContainer}>
        <button onClick={ props.handleSubmit }>{ props.buttonText }</button>
      </div>
      <div className={styles.helpLinks}>
        <div onClick={ props.handleChangeFormType }>{ props.formType }</div>
        <div onClick={ props.handleResetPassword }>Reset password</div>
      </div>
    </form>
  );
}

export default LoginForm;