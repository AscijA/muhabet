import React from 'react';
import styles from './LoginForm.module.css';

function LoginForm(props) {
  return (
    <form >
      <div className={ styles.formInput }>
        <label >Email address</label>
        <input type="text" value={ props.email } onChange={ props.handleChangeEmail } />
        <div >We'll never share your email with anyone else.</div>
      </div>
      <div className={ styles.formInput }>
        <label >Password</label>
        <input type="password" value={ props.password } onChange={ props.handleChangePassword } />
      </div>
      <div>
        <button onClick={ props.handleSubmit }>{ props.buttonText }</button>
      </div>
      <div>
        <div onClick={ props.handleChangeFormType }>{ props.formType }</div>
      </div>
      <div onClick={ props.handleResetPassword }>Reset password</div>
    </form>
  );
}

export default LoginForm;