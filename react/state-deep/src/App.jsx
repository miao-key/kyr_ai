import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('');
  const handleClick = () => {
    // 异步 不是同步
    // react  性能优化，合并多次更新 统一处理
    // 重绘重排
    // 数据绑定，界面更新
    // JS 引擎 V8 , 高速过路费 渲染引擎 Blink
    // setCount(count + 1);
    // setCount(count + 3);
    // setCount(count + 2);
    // setColor("")
    // setTitle("")
    // setState 函数式更新语法
    // 每个更新都基于上一个最新的更新
    // 界面的更新合并为一次的，
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);

  }
  return (
    <>
      <p>当前记数：{count}</p>
      <button onClick={handleClick}>+3</button>
    </>
  )
}

export default App
