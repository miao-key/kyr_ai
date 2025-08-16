import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { showToast } from '@/components/Toast/toastController';
import styles from './index.module.css';

function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟请求文章详情
    setTimeout(() => {
      // 假设这是从API获取的文章详情
      const mockArticle = {
        id: parseInt(id, 10),
        title: '一个usePrevious引发的血案',
        content: '那是一个平静的周五下午，我正准备提早下班享受周末，突然运营小姐姐火急火燎地跑过来: "页面上的数据显示有问题！用户投诉说前后对比功能完全乱了！"\n\n打开生产环境，问题确实存在——用户数据对比图上，原来该显示的是"优化前 vs 优化后"的数据，现在却变成了"优化后 vs 优化后"，完全没有参考价值。\n\n检查代码后发现，这是由于错误使用了usePrevious自定义Hook导致的问题。',
        author: {
          name: 'ReactUse',
          avatar: 'https://p3-passport.byteimg.com/img/user-avatar/5e0c65b7d9d0690522046698038f9378~100x100.awebp'
        },
        publishDate: '2023-07-15 14:22',
        tags: ['React', 'Hooks', 'Bug修复'],
        views: 114,
        likes: 2,
        comments: 5
      };
      
      setArticle(mockArticle);
      setLoading(false);
      showToast('文章加载完成', 'success');
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.error}>
        文章不存在或已被删除
      </div>
    );
  }

  return (
    <div className={styles.article}>
      <h1 className={styles.title}>{article.title}</h1>
      
      <div className={styles.meta}>
        <div className={styles.author}>
          <img src={article.author.avatar} alt={article.author.name} className={styles.avatar} />
          <span>{article.author.name}</span>
        </div>
        <span className={styles.date}>{article.publishDate}</span>
      </div>
      
      <div className={styles.tags}>
        {article.tags.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
      
      <div className={styles.content}>
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      <div className={styles.actions}>
        <button className={styles.likeButton}>
          <span className={styles.icon}>👍</span>
          <span>{article.likes}</span>
        </button>
        <button className={styles.commentButton}>
          <span className={styles.icon}>💬</span>
          <span>{article.comments}</span>
        </button>
      </div>
    </div>
  );
}

export default Article;