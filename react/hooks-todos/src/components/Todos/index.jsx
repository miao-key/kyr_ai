import { 
    useState,// react 函数式编程 好用的以use开头的函数
    useEffect
} from 'react'


import TodoForm from './TodoForm'
import TodoList from './TodoList'
import {useTodos} from '@/hooks/useTodos'

const Todos = () => {
    // 数据流管理
    // 父组件持有管理数据 props 传递数据 子组件通过props 自定义函数
    // 通知父组件 
    const {
        todos,
        addTodo,
        onToggle,
        onDelete,
    } = useTodos()
    // const [todos, setTodos] = useState([
    //     {
    //         id: 1,
    //         text: '学习react',
    //         isCompleted: false
    //     },
    //     {
    //         id: 2,
    //         text: '学习vue',
    //         isCompleted: false
    //     }
    // ])
    // 新增todo
    // 数据状态是对象的时候
    
    

    return (
        <div className="app">
            
            {/* Todos */}
            {/* 自定义事件 */}
            <TodoForm onAddTodo={addTodo}/>
            <TodoList 
            todos={todos}
            onToggle={onToggle}
            onDelete={onDelete}
            />
        </div>
    )
}



export default Todos;