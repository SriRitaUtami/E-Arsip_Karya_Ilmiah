import React from 'react';
import styles from '../styles/component/HeaderBox.module.css';

const HeaderBox = () => {
  return (
    <div className={styles.headerBox}>
      <div className={styles.headerContent}>
        <p>E-Arsip Karya Ilmiah</p>
        <img src="/logo.png" alt="Logo" />
      </div>
    </div>
  );
};

export default HeaderBox;


