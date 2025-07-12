import { useState } from 'react'
import './App.css'
// todos 列表需要渲染
// 函数组件  App 组件 组合其他的组件完成应用
// 返回html 的函数
// html css js 用函数组合在一起，组件
// function App() {
//   // react 比vue 更纯粹
//   const todos = ['吃饭', '喝酒', '打太极']; // 数组 -> 数据
//   return (
//     <>
//       <table>
//         <thead>
//           <tr>
//             <th>序号</th>
//             <th>任务</th>
//           </tr>
//         </thead>
//         <tbody>
//         {
//           // 动态
//           // react 一个括号
//           // js DOM 编程API
//           // 在html 里写js 代码
//           todos.map((item, index) => (
//             <tr>
//               <td>{index + 1}</td>
//               <td>{item}</td>
//             </tr>
//             )
//           )
//         }
//         </tbody>
//       </table>
//     </>
//   )
// }
function App(){
  // 数据 ->数据状态 数据业务 改变的 数据状态
  const [todos, setTodos] = useState(['吃饭', '喝酒', '打太极']);
  const [title,setTitle] = useState('斗尊 强者如斯');
  setTimeout(() => {
    setTodos(['吃饭', '喝酒', '打太极', '钓鱼']);
    setTitle('腾讯强者 恐怖如斯');
  }, 2000)
  return(
    <div>
      <h1 className='title'>{title}</h1>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>任务</th>
          </tr>
        </thead>
        <tbody>
          {
            // html 模板
            todos.map((item,index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{item}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}
export default App