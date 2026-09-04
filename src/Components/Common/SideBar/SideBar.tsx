import React from 'react';
import styles from "./SideBar.module.scss";

interface SideBarProps {
  isChat?: boolean;
  children: React.ReactNode;
}

const SideBar: React.FC<SideBarProps> = (props) => {
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
