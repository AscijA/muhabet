import React from 'react';
import styles from "./BasicModal.module.css";

export default function BasicModal(props) {
  
  return (

    <div className={ styles.outerContainer }>
      <div className={ styles.modalContainer }>
        <div className={ styles.closeBar }>
          <div className={ styles.closeButton } onClick={ props.handleResetPasswordToggle }>X</div>
        </div>
        <div className={styles.childContainer}>
            {props.children }
        </div>
      </div>
    </div>
  );
}
