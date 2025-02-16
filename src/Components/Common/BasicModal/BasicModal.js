import React from 'react';
import styles from "./BasicModal.module.scss";

/**
 * BasicModal component is a re-usable component for modals with different styles and sizes.
 * @param {boolean} fullscreen - Whether the modal should be fullscreen or not.
 * @param {boolean} transparent - Whether the modal should be transparent or not.
 * @param {function} handleToggleModal - The function to be called when the modal is closed.
 */
const BasicModal = (props) => {
  let modalTypeStyles = styles.baseContainer + (props.fullscreen ? " " + styles.fullscreenContainer : " " + styles.containedContainer);
  modalTypeStyles = modalTypeStyles + (props.transparent ? " " + styles.transparentContainer : "");
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
};
export default BasicModal;