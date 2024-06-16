import React from 'react';
import styles from "./SideBar.module.css";

export default function SideBar(props) {
  let widthStyle = styles.sign + (props.isChat ? " " +  styles.chatWidth : "");
  return (
    <div className={ styles.container } >
      <div className={ widthStyle }>
        <div className={ styles.innerContainer }>
          { props.children }
        </div>
      </div>
    </div>
  );
}
