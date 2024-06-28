import React from 'react';
import styles from "./BasicModal.module.scss";

export default function BasicModal(props) {
  let modalTypeStyles = styles.baseContainer + (props.fullscreen ? " " +  styles.fullscreenContainer : " " +  styles.containedContainer);
  
  return (
    <div className={ modalTypeStyles }>
      <div className={ styles.modalContainer }>
        <div className={ styles.closeBar }>
          <div className={ styles.closeButton } onClick={ props.handleToggleModal }>X</div>
        </div>
        <div className={styles.childContainer}>
            {props.children }
        </div>
      </div>
    </div>
  );
}
