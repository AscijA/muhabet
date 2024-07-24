import React from 'react';
import styles from "./ChatItem.module.scss";


function ChatItem(props) {
  return (
    <div className={ styles.chatItemContainer }>
      <div className={ "" === "" ? styles.contactPic : styles.contactPicBG }>
        <img className={ styles.contactPicImg } src={ "" } alt="" />
      </div>
      <div className={styles.chatInfo}>
        <div className={ styles.chatItemProfile }>
          <div className={ styles.chatTitle } >
            <div>
              ascija111@gmail.com
            </div>
            <div className={ styles.statusAndTime }>
              <div>
                S
              </div>
              <div>
                20:15
              </div>
            </div>
          </div>

        </div>
        <div className={ styles.chatItemMostRecentMessageSeen }>
          <div>
            Message text
          </div>
          <div className={ styles.chatItemNumberOfUnreadMessages }>
            5
          </div>
        </div>
      </div>

    </div>
  );
}

export default ChatItem;