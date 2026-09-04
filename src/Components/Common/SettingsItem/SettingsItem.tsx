import React from 'react';
import styles from './SettingsItem.module.scss';

interface SettingsItemProps {
  color?: string;
  title: string;
  onClick?: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = (props) => {
  return (
    <div className={ styles.settingsItemContainer } onClick={ props.onClick }>
      <h3 className={ props.color ? (styles[props.color] || "") : "" }>{ props.title }</h3>
    </div>
  );
};

export default SettingsItem;