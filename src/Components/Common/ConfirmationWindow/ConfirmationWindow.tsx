import React from 'react';
import styles from './ConfirmationWindow.module.scss';
import BasicModal from '../BasicModal/BasicModal';
import CustomButton from '../Buttons/CustomButton';

interface ConfirmationWindowButton {
  text: string;
  onClick: () => void;
}

interface ConfirmationWindowProps {
  handleToggleModal: () => void;
  text: string;
  buttons: ConfirmationWindowButton[];
}

const ConfirmationWindow: React.FC<ConfirmationWindowProps> = (props) => {
  return (
    <BasicModal
      handleToggleModal={ props.handleToggleModal }
      fullscreen={ true }
      transparent={ true }
    >
      <div className={ styles.confirmationWindow }>
        <h4>{ props.text }</h4>
        <div className={styles.buttonContainer}>
          { props.buttons.map((button, index) => {
            return <CustomButton
              key={ index }
              handleSubmit={ button.onClick }
              buttonText={ button.text }
              buttonSize="sm"
              buttonType="filled" />;
          }) }
        </div>
      </div>
    </BasicModal>
  );
};

export default ConfirmationWindow;