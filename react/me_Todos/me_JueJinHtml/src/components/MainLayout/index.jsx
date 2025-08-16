import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import AppDialog from '../AppDialog';
import styles from './index.module.css';

function MainLayout() {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.mainContent}>
          <Outlet />
        </div>
      </div>
      <AppDialog />
    </div>
  );
}

export default MainLayout;