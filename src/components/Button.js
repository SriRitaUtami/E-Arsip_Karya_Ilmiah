import React from 'react';
import styles from '../styles/component/Button.module.css';

const Button = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
