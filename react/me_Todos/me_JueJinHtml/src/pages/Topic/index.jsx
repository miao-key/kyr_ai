import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { showToast } from '@/components/Toast/toastController';
import styles from './index.module.css';

function Topic() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟请求话题详情
    setTimeout(() => {
      // 假设这是从API获取的话题详情
      const mockTopic = {
        id: parseInt(id, 10) || 1,
        name: 'React',
        description: 'React 是用于构建用户界面的 JavaScript 库，让你可以创建交互式UI的最流行前端框架之一。',
        followers: 45800,
        articles: 25600
      };

      const mockArticles = [
        {
          id: 1,
          title: '一个usePrevious引发的血案',
          content: '那是一个平静的周五下午，我正准备提早下班享受周末，突然运营小姐姐火急火燎地跑过来: "页面上的数据显示有问题！用户投诉说前后对比功能完全乱了！"',
          author: 'ReactUse',
          views: 114,
          likes: 2
        },
        {
          id: 2,
          title: 'React 性能优化技巧',
          content: '本文将分享一些React应用性能优化的实用技巧，包括组件优化、渲染优化和状态管理优化等方面。',
          author: 'React专家',
          views: 3500,
          likes: 124
        },
        {
          id: 3,
          title: 'React Hooks最佳实践',
          content: '深入探讨React Hooks的使用技巧和最佳实践，避免常见的陷阱和问题。',
          author: 'Hooks达人',
          views: 5600,
          likes: 230
        },
      ];
      
      setTopic(mockTopic);
      setArticles(mockArticles);
      setLoading(false);
      showToast('话题加载完成', 'success');
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.error}>
        话题不存在或已被删除
      </div>
    );
  }

  return (
    <div className={styles.topicPage}>
      <div className={styles.topicHeader}>
        <h1 className={styles.topicName}>{topic.name}</h1>
        <p className={styles.topicDescription}>{topic.description}</p>
        <div className={styles.topicMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>文章数</span>
            <span className={styles.metaValue}>{topic.articles}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>关注者</span>
            <span className={styles.metaValue}>{topic.followers}</span>
          </div>
        </div>
        <button className={styles.followButton}>关注话题</button>
      </div>
      
      <div className={styles.topicContent}>
        <h2 className={styles.sectionTitle}>热门文章</h2>
        <div className={styles.articleList}>
          {articles.map(article => (
            <div key={article.id} className={styles.articleItem}>
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleContent}>{article.content}</p>
              <div className={styles.articleMeta}>
                <span className={styles.author}>{article.author}</span>
                <span className={styles.views}>{article.views}</span>
                <span className={styles.likes}>{article.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Topic;