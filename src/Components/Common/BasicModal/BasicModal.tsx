import React from 'react';
import styles from "./BasicModal.module.scss";

interface BasicModalProps {
  fullscreen?: boolean;
  transparent?: boolean;
  handleToggleModal: () => void;
  children: React.ReactNode;
}

const BasicModal: React.FC<BasicModalProps> = (props) => {
  let modalTypeStyles = styles.baseContainer + (props.fullscreen ? " " + styles.fullscreenContainer : " " + styles.containedContainer);
  modalTypeStyles = modalTypeStyles + (props.transparent ? " " + styles.transparentContainer : "");
  
  const handleBackroundClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      props.handleToggleModal();
    }
  };

  return (
    <div className={ modalTypeStyles } onClick={ handleBackroundClick } role="presentation">
      <div className={ styles.modalContainer } role="dialog" aria-modal="true">
        <div className={ styles.closeBar }>
          <button className={ styles.closeButton } onClick={ props.handleToggleModal } aria-label="Close dialog"></button>
        </div>
        <div className={ styles.childContainer }>
          { props.children }
        </div>
      </div>
    </div>
  );
};
export default BasicModal;
