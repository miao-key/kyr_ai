import {
  useEffect
} from 'react';

export default function App() {
  useEffect(() => {
    fetch('http://localhost:3000/chat',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '你好',
      }),
    })
    .then(data => {
      console.log(data);
    })
  },[]);
  return (
    <div className="flex">
    
    </div>
  )
}