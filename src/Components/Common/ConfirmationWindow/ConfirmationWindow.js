import React from 'react';
import BasicModal from '../BasicModal/BasicModal';
import CustomButton from '../Buttons/CustomButton';

import styles from './ConfirmationWindow.module.scss';

const ConfirmationWindow = (props) => {

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