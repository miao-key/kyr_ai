import { useState,useRef } from 'react'
import './App.css'
import { createBuilder } from 'vite';

function App() {
  // 配置
  const {VITE_TOKEN,VITE_APP_ID,VITE_CLUSTER_ID} =import.meta.env;
  console.log(VITE_TOKEN,VITE_APP_ID,VITE_CLUSTER_ID,'////');
  const [prompt,setPrompt] = useState('宝宝，你好可爱');
  // 状态 ready , waiting ,done 界面由数据状态驱动
  const [status,setStatus] = useState('ready');
  // DOM 对象绑定 use 开头的都叫hooks 函数
  const audioRef =useRef(null);

function createBlobURL(base64AudioData) {
    var byteArrays = []; 
    var byteCharacters = atob(base64AudioData); 
    for (var offset = 0; offset < byteCharacters.length; offset++) { 
      var byteArray = byteCharacters.charCodeAt(offset); 
      byteArrays.push(byteArray); 
    } 
    var blob = new Blob([new Uint8Array(byteArrays)], { type: 'audio/mp3' }); 
    return URL.createObjectURL(blob);
  }

// 调用火山的接口，返回语音
const generateAudio =()=> {
  const voiceName = 'zh_female_liuyifei_bigtts';// 角色
  const endpoint = '/tts/api/v1/tts'; // API地址

  const headers ={
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${VITE_TOKEN}`
  }
  // 请求体
  const payload ={
    app:{
      token:VITE_TOKEN,
      appid:VITE_APP_ID,
      cluster_id:VITE_CLUSTER_ID
    },
    user:{
      uid:'bearbobo'
    },
    audio:{
      voice_name:voiceName,
      encoding:'ogg_opus', // 编码
      compression_rate:1, // 压缩的比例
      rate: 24000,
      speed_ratio:1.0,
      volume_ratio:1.0,
      pitch_ratio:1.0,
      emotion:'happy'//情绪
    },
    request: {
        reqid: Math.random().toString(36).substring(7),
        text: prompt,
        text_type: 'plain',
        operation: 'query', 
        silence_duration: '125', 
        with_frontend: '1', 
        frontend_type: 'unitTson', 
        pure_english_opt: '1',
      }
    }
    setStatus('loading');
    fetch(
      endpoint,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      }
    ).then(res => res.json())
    .then(data => {
      // console.log(data, '/////////////////')
      // 黑盒子 base64 字符串编码的格式表达图片，声音，视频，
      // 编码的问题
      const url = createBlobURL(data.data);
      audioRef.current.src = url;
      audioRef.current.play();
      setStatus('done');
    })
}
  return (
    <div className='container'>
      <div>
        <label>Prompt</label>
        <button onClick={generateAudio}>生成并播放</button>
        <textarea 
        className='input' 
        value={prompt} 
        onChange={(e)=>setPrompt(e.target.value)}></textarea>
      </div>
      <div className='out'>
        <div>{status}</div>
        <audio ref={audioRef}/>
         
        </div>
      </div>
    
  )
}

export default App
