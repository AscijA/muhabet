import React from 'react';
import styles from './SettingsItem.module.scss';

const SettingsItem = ({ title, onClick, color }) => {
  return (
    <div className={ styles.settingsItemContainer } onClick={ onClick }>
      <h3 className={styles[color] || ""}>{ title }</h3>
    </div>
  );
};

export default SettingsItem;