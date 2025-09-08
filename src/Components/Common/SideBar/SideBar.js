import React from 'react';
import styles from "./SideBar.module.scss";

/**
 * SideBar component is a re-usable component for a sidebar with a chat width.
 * @param {boolean} isChat - A boolean value to determine if the sidebar is for chat or not.
 * @param {JSX} children - The children components to be rendered inside the sidebar.
 */
const SideBar = (props) => {
  let widthStyle = styles.sign + (props.isChat ? " " + styles.chatWidth: "");
  let innerContainerStyle = styles.innerContainer + (props.isChat ? " " + styles.fh : "");
  return (
    <div className={ styles.container } >
      <div className={ widthStyle }>
        <div className={ innerContainerStyle }>
          { props.children }
        </div>
      </div>
    </div>
  );
};

export default SideBar;
