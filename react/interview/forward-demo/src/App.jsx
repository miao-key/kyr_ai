import { 
  useRef,
  useEffect,
  forwardRef
} from 'react'
import './App.css'

function Guang (props,ref){
  console.log(props,ref);
  return (
    <div>
      <input type='text' ref={ref}/>
    </div>
  )
}

// 返回一个全新组件，ref 向下传递的能力
// 高阶组件
const WrapperGuang = forwardRef(Guang);

function App() {
  // 父组件 ref 指向子组件
  const ref = useRef(null);
  console.log(ref.current);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);
  
  return (
    <div className='App'>
      {/* <input ref={ref} /> */}
      {/* <Guang ref={ref}/> */}
      <WrapperGuang ref={ref}/>
    </div>
  )
}

export default App