import React from 'react';
import styles from "./CustomButton.module.scss";

/**
 * CustomButton component is a re-usable component for buttons with different styles and sizes.
 * @param {string} buttonText - The text displayed in the button.
 * @param {string} buttonType - The type of the button, can be "filled" or "outlined".
 * @param {string} buttonSize - The size of the button, can be "sm" or "lg".
 * @param {function} handleSubmit - The function to be called when the button is clicked.
 */
export default function CustomButton(props) {
  let buttonStyle = props.buttonType === "filled" ? styles.filled : styles.outlined;
  buttonStyle = buttonStyle + (props.buttonSize === "sm" ? " " + styles.smallButton : "");
  return (
    <div className={ styles.buttonContainer }>
      <button
        className={ buttonStyle }
        onClick={ props.handleSubmit }>
        { props.buttonText }
      </button>


    </div>
  );

}
