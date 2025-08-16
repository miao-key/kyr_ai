import React, { useState, useEffect } from 'react';
import { toastEvents } from './toastController';
import styles from './index.module.css';

function Toast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // info, success, error, warning
  
  useEffect(() => {
    const handleShow = (data) => {
      setMessage(data.message);
      setType(data.type || 'info');
      setVisible(true);
      
      // 自动隐藏
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    };
    
    // 监听自定义事件
    toastEvents.on('show', handleShow);
    
    // 组件卸载时，取消监听
    return () => {
      toastEvents.off('show', handleShow);
    };
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        {message}
      </div>
    </div>
  );
}

export default Toast;