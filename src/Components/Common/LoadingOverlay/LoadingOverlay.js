import React from 'react';
import styles from "./LoadingOverlay.module.scss";
import { ThreeCircles } from 'react-loader-spinner';
export const LoadingOverlay = (props) => {
  return (
    <div className={ styles.outerContainer }>

      <ThreeCircles
        visible={ true }
        height="100"
        width="100"
        color="#4b43e8"
        ariaLabel="three-circles-loading"
        wrapperStyle={ {} }
        wrapperClass=""
      />
    </div>
  );
};
