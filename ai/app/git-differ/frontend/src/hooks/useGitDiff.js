// 封装git diff 得到llm 给我们的规范的commit message
import { useState, useEffect } from 'react';
import { chat } from '../api/index';

// use开头，封装响应式业务,副作用等，从组件里面剥离
// 组件单一的UI
export const useGitDiff = (diff) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      (async () => {
        setLoading(true);
        const{data} = await chat('你好');
        setContent(data.reply);
        setLoading(false);
      })();
    },[diff]);
    return {
        loading,  // 加载中
        content, // commit message
    }
}