import React from 'react';
import styles from "./CustomButton.module.scss";

interface CustomButtonProps {
  buttonText: string;
  buttonType?: "filled" | "outlined" | string;
  buttonSize?: "sm" | "lg" | string;
  handleSubmit: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = (props) => {
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
};

export default CustomButton;