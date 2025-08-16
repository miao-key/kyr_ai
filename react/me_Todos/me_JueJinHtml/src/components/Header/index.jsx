import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

function Header() {
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>
            <Link to="/">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1e80ff"/>
                <path d="M2 17L12 22L22 17" stroke="#1e80ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#1e80ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          
          <div className={styles.homeText}>
            <span>首页</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#86909C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className={styles.tabs}>
            <Link to="/" className={`${styles.tab} ${styles.active}`}>关注<span className={styles.redDot}></span></Link>
            <Link to="/recommend" className={styles.tab}>综合</Link>
            <Link to="/following" className={styles.tab}>排行榜</Link>
            <Link to="/backend" className={styles.tab}>后端</Link>
            <Link to="/frontend" className={styles.tab}>前端</Link>
            <Link to="/android" className={styles.tab}>Android</Link>
          </div>
        </div>
        
        <div className={styles.rightSection}>
          <div className={styles.searchIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.33333 13.3333C11.0948 13.3333 13.3333 11.0948 13.3333 8.33333C13.3333 5.57191 11.0948 3.33333 8.33333 3.33333C5.57191 3.33333 3.33333 5.57191 3.33333 8.33333C3.33333 11.0948 5.57191 13.3333 8.33333 13.3333Z" stroke="#86909C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M16.6667 16.6667L12.5 12.5" stroke="#86909C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          
          <div className={styles.notificationIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13115C12.5979 2.19348 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19348 6.46447 3.13115C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z" stroke="#86909C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5789 18.2537 10.292 18.3304 10 18.3304C9.70803 18.3304 9.42117 18.2537 9.16816 18.1079C8.91514 17.9622 8.70485 17.7526 8.55835 17.5" stroke="#86909C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className={styles.userAvatar}>
            <img src="https://p3-passport.byteacctimg.com/img/user-avatar/4e9e751e2b32fb8afbbf559a296ccbf2~300x300.image" alt="用户头像" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;