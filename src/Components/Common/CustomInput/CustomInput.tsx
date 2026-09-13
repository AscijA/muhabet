import React, { useId } from 'react';
import styles from "./CustomInput.module.scss";

interface CustomInputProps {
  label?: string;
  inputType: string;
  stateElement: string;
  stateElementChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput: React.FC<CustomInputProps> = (props) => {
  const inputId = useId();
  return (
    <div className={ styles.formInput }>
      <label htmlFor={ inputId }>{ props.label }</label>
      <input id={ inputId } type={ props.inputType }
        value={ props.stateElement }
        onChange={ props.stateElementChangeHandler } />
    </div>
  );
}

export default CustomInput;
