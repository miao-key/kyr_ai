# react repos 项目开发
- api.github.io/users/username/repos
- 综合react开发全家桶、项目级别、大型的、性能
- todos
- demo

## 路由设计
     - react-router-demo
     - /users/username
     - /respos/:username
     - /respos/:id
       懒加载
          hash/history
         （路由守卫）
## 数据管理
     App 数据管理
     repos
     useContext + useReducer + hooks
     createContext + reducer + useRepos
## react
    组件的力度
## api 
    fetch
    - axios http 请求库
    - 独立的模块，所有的请求都会从组件中分离到api目录下

## 项目目录结构，项目架构
    - api
        应用中的所有接口
    - main.jsx
        入口文件
        添加路由，SPA
        添加全局应用状态管理