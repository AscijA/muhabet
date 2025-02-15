import React from 'react';
import styles from './SettingsItem.module.scss';
const SettingsItem = ({ title, onClick }) => {
  return (
    <div className={ styles.settingsItemContainer } onClick={ onClick }>
      <h3>{ title }</h3>
    </div>
  );
};

export default SettingsItem;