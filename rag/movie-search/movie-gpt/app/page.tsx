"use client";
// hooks 
import {
  useChat
} from '@ai-sdk/react';
import { useRef, useEffect } from 'react';
import ChatOutput from '@/components/ChatOutput';
import ChatInput from '@/components/ChatInput';

export default function Home() {
  // chat llm 业务 抽离
  const {
    input, // 输入框的值
    messages, // 消息列表
    status, // 状态 
    handleInputChange, // 输入框变化
    handleSubmit, // 提交
  } = useChat();
  
  // 滚动容器引用
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  
  // 检查是否在底部
  const isAtBottom = () => {
    if (!scrollRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    return scrollTop + clientHeight >= scrollHeight - 50; // 50px的容差
  };
  
  // 监听消息变化，只有在底部时才自动滚动
  useEffect(() => {
    if (isAtBottom()) {
      scrollToBottom();
    }
  }, [messages]);
  
  // 监听流式输出状态，确保实时滚动
  useEffect(() => {
    if (status === 'streaming') {
      const timer = setInterval(() => {
        if (isAtBottom()) {
          scrollToBottom();
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [status]);
  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">movieGPT</h1>
        <p className="text-gray-600 dark:text-gray-400">🎬 你的私人电影推荐助手</p>
      </header>
      
      <div className="flex-1 mb-6">
        <div 
          ref={scrollRef}
          className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pr-2"
        >
          <ChatOutput messages={messages} status={status}/>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </main>
  )
}