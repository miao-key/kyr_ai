import {
   useState,
   useEffect,
   useCallback,
   useMemo // 缓存一个负责计算的值
  } from 'react'
import './App.css'
import Button from './components/Button'

function App() {
  const [count, setCount] = useState(0)
  const [num, setNum] = useState(0)
  console.log('App render')

  const expensiveComputation = (n) => {
    // 复杂计算 开销高
    console.log('expensiveComputation')
    for(let i = 0; i < 1000000000; i++) {
      i++
    }
    return n*2
  }
  const result = useMemo(() => expensiveComputation(num),[num])
  useEffect(() => {
    console.log('count', count)
  }, [count])
  useEffect(() => {
    console.log('num', num)
  }, [num])
  // rerender 重新生成
  // 不要重新生成,和useEffect []一样
  // 正确的 handleClick 函数定义，使用 useCallback
const handleClick = useCallback(() => {
  console.log('handleClick')
}, [num]) // 正确的 useCallback 依赖项语法
  return (
    <>
      {/* <div>{expensiveComputation(num)}</div> */}
      <div>{result}</div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+</button>
      <br />
      <button onClick={() => setNum(num + 1)}>+</button>
      <br />
      <Button num={num} onClick={handleClick}>Click Me Me</Button>
    </>
  )
}

export default App
