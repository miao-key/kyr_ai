import { useState } from 'react'
import './App.css'
import Todos from './components/Todos'

function App() {
  

  return (
    <>
      {/* 开发的任务单位就是组件 */}
      <div>
      {/* <div style={{fontSize:'14px',width:'3.5714rem',height:'3.5714rem',background:'green'}}> */}
        <Todos />
      </div>
    </>
  )
}

export default App
