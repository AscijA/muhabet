import React from 'react';
import styles from "./BasicModal.module.scss";

export default function BasicModal(props) {
  let modalTypeStyles = styles.baseContainer + (props.fullscreen ? " " + styles.fullscreenContainer : " " + styles.containedContainer);
  modalTypeStyles = modalTypeStyles + (props.transparent ? " " + styles.transparentContainer : "")
  const handleBackroundClick = (event) => {
    if (event.target === event.currentTarget) {
      props.handleToggleModal();
    }
  };

  return (
    <div className={ modalTypeStyles } onClick={ handleBackroundClick }>
      <div className={ styles.modalContainer }>
        <div className={ styles.closeBar }>
          <div className={ styles.closeButton } onClick={ props.handleToggleModal }></div>
        </div>
        <div className={ styles.childContainer }>
          { props.children }
        </div>
      </div>
    </div>
  );
}
