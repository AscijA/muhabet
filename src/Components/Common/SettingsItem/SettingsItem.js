import React from 'react';
import styles from './SettingsItem.module.scss';

/** List item to be shown in the settings modal and contact info modal
 *  
 * @param {string} color - Color of the text
 * @param {string} title - Title of the item
 * @param {function} onClick - Function to be called when the item is clicked 
 */
const SettingsItem = (props) => {
  return (
    <div className={ styles.settingsItemContainer } onClick={ props.onClick }>
      <h3 className={styles[props.color] || ""}>{ props.title }</h3>
    </div>
  );
};

export default SettingsItem;