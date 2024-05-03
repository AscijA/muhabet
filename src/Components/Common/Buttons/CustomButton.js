import React from 'react';
import styles from "./CustomButton.module.css";


export default function CustomButton(props) {
  let buttonStyle = props.buttonType === "filled" ? styles.filled : styles.outlined;
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
