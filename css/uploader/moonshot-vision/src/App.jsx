import { useState } from 'react'
import './App.css'

function App() {
  console.log(import.meta.env.VITE_KIMI_API_KEY);
  // react 内置的hook (钩子)函数 快速的解决一些问题 响应式的数据状态
  // useRef DOM 等对象的绑定
  const [content, setContent] = useState('')
  const [imageBase64Data, setImageBase64Data] = useState('')
  const [isValid, setIsValid] = useState(false)
  // base64? google 推出的编码方案
  const updateBase64Data = (e) => {
    // 拿到图片  e html5  js 和操作系统本地文件交互
    const file =e.target.files[0];
    // console.log(file);
    if(!file) return;
    // html5 读的方式 读取文件
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // 异步操作
    reader.onload = () => {
      // console.log(reader.result);
      setImageBase64Data(reader.result)
      setIsValid(true)
    }
  }
  const update = () => {

  }
  return (
    <div className="container">
     <div>
      <label htmlFor="fileInput">文件：</label>
      <input 
      type="file"
      id="fileInput"
      className="input"
      accept=".jpg,.jpeg,.png,.gif"
      onChange={updateBase64Data}
       />
       <button onClick={update} disabled={!isValid}>提交</button>
     </div>
     <div className="output">
      <div className="preview">
        {
          imageBase64Data && <img src={imageBase64Data} alt="" />
        }
      </div>
      <div>
        {content}
      </div>
     </div>
    </div>
  )
}

export default App
