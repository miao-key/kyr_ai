// http 请求库

import axios from 'axios';

// 比fetch好，模块化
// api 目录下管理所有的请求
const service = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

export const chat = (message) => 
  service.post('/chat', {message})
