# typescript
- js 的超集
- 类型约束
- ts 在 react业务中的用法，直接抄作业
  - 子组件 + props的约定
  interface Props {

  }
  : React.FC<Props>
  - 组件
    - 单向数据流
    - props  callback
    - 函数类型 () => void
    - 参数的类型约定
    - React 对ts 原生支持的非常好
      React.FC
      React.ChangeEvent<HTMLInputElement>