import React from 'react';
import styles from './index.module.css';

function AppDialog() {
  return (
    <div className={styles.appDialog}>
      <button className={styles.appButton}>
        APP内打开
      </button>
    </div>
  );
}

export default AppDialog;