import React from 'react';
import styles from "./CustomInput.module.scss";

interface CustomInputProps {
  label?: string;
  inputType: string;
  stateElement: string;
  stateElementChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput: React.FC<CustomInputProps> = (props) => {
  return (
    <div className={ styles.formInput }>
      <label>{ props.label }</label>
      <input type={ props.inputType }
        value={ props.stateElement }
        onChange={ props.stateElementChangeHandler } />
    </div>
  );
}

export default CustomInput;