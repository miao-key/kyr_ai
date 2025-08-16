import React from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

function Content({ children }) {
  const [activeTab, setActiveTab] = React.useState('推荐');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const tabs = ['推荐', '最新'];

  return (
    <div className={styles.contentContainer}>
      <div className={styles.tabContainer}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className={styles.articleList}>
        {children ? children : (
          <>
            <ArticleItem 
              title="一个usePrevious引发的血案"
              content="那是一个平静的周五下午，我正准备提早下班享受周末，突然运营小姐姐火急火燎地跑过来: '页面上的数据显示有问题！用户投诉说前后对比功能完全乱了！'"
              author="ReactUse"
              views="114"
              likes="2"
            />
            
            <ArticleItem 
              title="离职转AI独立开发半年，我感受到了真正的生活"
              content="离职转AI独立开发半年，我感受到了真正的生活 我的新产品: https://code.promptate.xyz/ 开场"
              author="aircrushin"
              views="25k"
              likes="338"
              hasImage={true}
              imageSrc="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec65711c056342c3a5f464e00e5efaf9~tplv-k3u1fbpfcp-no-mark:240:240:240:160.awebp"
            />
            
            <ArticleItem 
              title="我发现凡是给offer的公司，面试时基本不问技术细节，那些问得又多又细的公司，后面就没下文了！"
              content="最近，有一位程序员朋友提起了一个十分有意思的话题: 凡是给offer的公司，面试时基本不问技术细节，那些问得又多又细的公司，后面就没下文了。"
              author="程序员小张"
              views="98k"
              likes="530"
            />
          </>
        )}
      </div>
    </div>
  );
}

function ArticleItem({ title, content, author, views, likes, hasImage = false, imageSrc }) {
  return (
    <div className={styles.articleItem}>
      <div className={styles.articleContent}>
        <div>
          <Link to={`/article/1`} className={styles.articleTitle}>
            {title}
          </Link>
          <div className={styles.articleSummary}>
            {content}
          </div>
        </div>
        <div className={styles.articleMeta}>
          <span className={styles.author}>{author}</span>
          <span className={styles.viewCount}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2C3.27273 2 0.5 4 0.5 6C0.5 8 3.27273 10 6 10C8.72727 10 11.5 8 11.5 6C11.5 4 8.72727 2 6 2ZM6 8.66667C4.59091 8.66667 3.45455 7.46667 3.45455 6C3.45455 4.53333 4.59091 3.33333 6 3.33333C7.40909 3.33333 8.54545 4.53333 8.54545 6C8.54545 7.46667 7.40909 8.66667 6 8.66667ZM6 4.33333C5.15 4.33333 4.45455 5.06667 4.45455 6C4.45455 6.93333 5.15 7.66667 6 7.66667C6.85 7.66667 7.54545 6.93333 7.54545 6C7.54545 5.06667 6.85 4.33333 6 4.33333Z" fill="#86909C"/>
            </svg>
            {views}
          </span>
          <span className={styles.likeCount}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.12304 5.4H6.08654V2.628C6.08654 2.133 5.69104 1.8 5.24854 1.8H5.01754C4.59904 1.8 4.23904 2.097 4.20004 2.5155C4.00504 4.071 3.35454 5.1045 1.98454 5.4855C1.82704 5.529 1.70104 5.6655 1.70104 5.829V9.2415C1.70104 9.453 1.87604 9.6 2.10904 9.6H3.82204C4.10704 9.6 4.35554 9.4455 4.46704 9.2145C4.81204 8.5455 5.46604 8.1 6.19954 8.1H8.85154C9.24704 8.1 9.54304 7.8045 9.54304 7.4445V5.8245C9.54304 5.5845 9.36304 5.4 9.12304 5.4ZM8.64304 7.2H6.08654V6.3H8.64304V7.2Z" fill="#86909C"/>
            </svg>
            {likes}
          </span>
          <span className={styles.moreActions}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.79962 7.19992C1.99962 7.19992 1.33301 6.53329 1.33301 5.73329C1.33301 4.93329 1.99962 4.26663 2.79962 4.26663C3.59962 4.26663 4.26629 4.93329 4.26629 5.73329C4.26629 6.53329 3.59962 7.19992 2.79962 7.19992ZM9.19957 7.19992C8.39957 7.19992 7.7329 6.53329 7.7329 5.73329C7.7329 4.93329 8.39957 4.26663 9.19957 4.26663C9.99957 4.26663 10.6662 4.93329 10.6662 5.73329C10.6662 6.53329 9.99957 7.19992 9.19957 7.19992Z" fill="#86909C"/>
            </svg>
          </span>
        </div>
      </div>
      {hasImage && (
        <div className={styles.articleImageContainer}>
          <img src={imageSrc} alt={title} className={styles.articleImage} />
        </div>
      )}
    </div>
  );
}

export default Content;