import React from 'react';
import styles from "./SideBar.module.css";

export default function SideBar(props) {

  return (
    <div className={ styles.container } >
      <div className={ styles.sign }>
        <div className={ styles.innerContainer }>
          { props.children }
        </div>
      </div>
    </div>
  );
}
