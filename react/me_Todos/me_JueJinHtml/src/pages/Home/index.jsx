import React from 'react';
import Content from '@/components/Content';
import styles from './index.module.css';

function Home() {
  return (
    <div className={styles.home}>
      <Content />
    </div>
  );
}

export default Home;