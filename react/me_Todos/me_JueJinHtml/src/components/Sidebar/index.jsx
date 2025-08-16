import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

function Sidebar() {
  const [topics, setTopics] = React.useState([
    { id: 1, name: 'React', count: 12345 },
    { id: 2, name: 'Vue', count: 10293 },
    { id: 3, name: 'JavaScript', count: 28721 }
  ]);
  
  const [topicTags, setTopicTags] = React.useState([
    { id: 1, name: 'React', active: true },
    { id: 2, name: 'Vue', active: false },
    { id: 3, name: 'JavaScript', active: false }
  ]);
  
  const refreshTopics = () => {
    const newTopics = [
      { id: 4, name: 'TypeScript', count: 8932 },
      { id: 5, name: 'Node.js', count: 7456 },
      { id: 6, name: 'Flutter', count: 5624 }
    ];
    setTopics(newTopics);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.block}>
        <div className={styles.signInBlock}>
          <div className={styles.signInContent}>
            <div className={styles.greeting}>早上好！</div>
            <div className={styles.subGreeting}>点亮在社区的每一天</div>
          </div>
          <button className={styles.signInButton}>去签到</button>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockTitle}>
          推荐话题
          <span className={styles.refresh} onClick={refreshTopics}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.66667 6.66667C9.48257 6.66667 9.33333 6.51743 9.33333 6.33333V5.66667C9.33333 5.48257 9.48257 5.33333 9.66667 5.33333L11.8303 5.3334C10.987 4.12437 9.58586 3.33333 8 3.33333C5.42267 3.33333 3.33333 5.42267 3.33333 8C3.33333 10.5773 5.42267 12.6667 8 12.6667C10.1139 12.6667 11.8996 11.2611 12.4733 9.33358L13.8513 9.33355C13.2449 12.0054 10.8554 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C9.88507 2 11.5671 2.86932 12.6671 4.22893L12.6667 2.33333C12.6667 2.14924 12.8159 2 13 2H13.6667C13.8508 2 14 2.14924 14 2.33333V6C14 6.35145 13.728 6.63939 13.3831 6.66484L13.3333 6.66667H9.66667Z" fill="#8A919F"></path>
            </svg>
            换一换
          </span>
        </div>

        <div className={styles.topicTags}>
          {topicTags.map(tag => (
            <span 
              key={tag.id} 
              className={`${styles.topicTag} ${tag.active ? styles.activeTag : ''}`}
              onClick={() => {
                setTopicTags(prev => prev.map(t => 
                  ({...t, active: t.id === tag.id})
                ));
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className={styles.topicList}>
          {topics.map(topic => (
            <Link to={`/topic/${topic.id}`} key={topic.id} className={styles.topicItem}>
              <span className={styles.topicName}>{topic.name}</span>
              <span className={styles.topicCount}>{topic.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.appBlock}>
          <div className={styles.appIcon}>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="50" height="50" rx="4" fill="#1E80FF"/>
              <path d="M32.9536 12.8855H16.1857C15.7599 12.8855 15.4126 13.2328 15.4126 13.6586V36.1294C15.4126 36.5552 15.7599 36.9024 16.1857 36.9024H32.9536C33.3794 36.9024 33.7266 36.5552 33.7266 36.1294V13.6586C33.7266 13.2328 33.3794 12.8855 32.9536 12.8855Z" fill="white"/>
              <path d="M28.6736 30.9202H20.4656C19.9669 30.9202 19.5623 31.3248 19.5623 31.8235V34.1461C19.5623 34.6447 19.9669 35.0494 20.4656 35.0494H28.6736C29.1723 35.0494 29.577 34.6447 29.577 34.1461V31.8235C29.577 31.3248 29.1723 30.9202 28.6736 30.9202Z" fill="#1E80FF"/>
              <path d="M28.6736 14.7386H20.4656C19.9669 14.7386 19.5623 15.1433 19.5623 15.642V26.9217C19.5623 27.4203 19.9669 27.825 20.4656 27.825H28.6736C29.1723 27.825 29.577 27.4203 29.577 26.9217V15.642C29.577 15.1433 29.1723 14.7386 28.6736 14.7386Z" fill="#1E80FF"/>
            </svg>
          </div>
          <div className={styles.appInfo}>
            <div className={styles.appTitle}>下载稀土掘金App</div>
            <div className={styles.appDesc}>一个帮助开发者成长的社区</div>
          </div>
          <button className={styles.appButton}>APP内打开</button>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.footer}>
          <ul className={styles.footerLinks}>
            <li className={styles.footerLink}>
              <Link to="/terms">用户协议</Link>
            </li>
            <li className={styles.footerLink}>
              <Link to="/license">营业执照</Link>
            </li>
            <li className={styles.footerLink}>
              <Link to="/privacy">隐私政策</Link>
            </li>
            <li className={styles.footerLink}>
              <Link to="/about">关于我们</Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;