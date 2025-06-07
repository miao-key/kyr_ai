# React 组件化

- vite 为何？
npm 包管理
    vite 工程化套件 塔吊、搅拌机...
    - 大型项目
    - 模板代码
    - 跑起来

- 何为组件
    组合了html,css,js的开发单元
    App.jsx 根组件
    - 标签粒度太细，只是工作的一个环节，不利于表达业务元素的抽象
    - TodoList 组件
    - 工作单位
    - 功能单位
- 组件如何划分 TodoList 为例
- 函数就是组件
    - return html 完成了模板{ 数据 }
    - return 之前 js 逻辑 数据....
    - 复用
    - 以html标签的形式，插入之

## 开发目录
    - todoListComponent 项目目录
    - src   开发目录
        - App.jsx 根组件
        - 组件放到components 目录下
        - css 放在src/
            相对路径 ../

## 模块化
    - 大型多人协作的项目
    - 模块化文件分离
        - 函数
        - 类
        - 文件分离 一个文件一个模块（类，函数，组件）
        - import XXX from '../components/XXX'
        - export default XXX

## 组件化思想
- 现代前端开发框架的核心思想
- 低级的DOM树编程-> 组件树编程
- 开发的最小单元
    html 只是沙子