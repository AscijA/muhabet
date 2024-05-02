import React from 'react';
import styles from "./CustomInput.module.css";
export default function CustomInput(props) {
  return (
    <div className={ styles.formInput }>
      <label >{ props.label }</label>
      <input type={ props.inputType }
        value={ props.stateElement }
        onChange={ props.stateElementChangeHandler } />
    </div>
  );

}
