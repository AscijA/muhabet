import React from 'react';
import styles from "./CustomInput.module.scss";

/**
 * CustomInput component is a re-usable component for input fields.
 * @param {string} label - The label for the input field.
 * @param {string} inputType - The type of the input field, can be "text", "password", "email", etc.
 * @param {string} stateElement - The state element that holds the value of the input field.
 * @param {function} stateElementChangeHandler - The function to be called when the input field value changes.
 */
const CustomInput = (props) => {
  return (
    <div className={ styles.formInput }>
      <label >{ props.label }</label>
      <input type={ props.inputType }
        value={ props.stateElement }
        onChange={ props.stateElementChangeHandler } />
    </div>
  );
}

export default CustomInput;