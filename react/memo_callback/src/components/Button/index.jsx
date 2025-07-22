import {
    useEffect,
    memo
} from 'react'
const Button = ({ num, onClick, children }) => {
    useEffect(() => {
      console.log('Button UseEffect')
    }, [])
    console.log('Button render')
    return <button onClick={onClick}>{num} {children}</button>
  }
  

//高阶组件
export default memo(Button)