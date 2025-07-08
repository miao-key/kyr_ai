## hooks todos

- 安排个css 亮点
  - stylus
      css 超集
  - 拥有vite脚手架
      stylus 预编译 安装 stylus vite 直接编译
      vite来自vue 社区
  - react 组件设计
      - 开发任务单元
      - 设计组件
          界面功能 状态 响应式
          - 新建todo 表单
          - 修改 列表
          - 删除
        - 按功能划分 力度
          - form
          - list 列表
              - Item 组件 维护和**性能**

- 字体
  - 设置多个，设备的支持（本地包含）
  - 苹果设备 apple-system 前端负责用户体验，字体也是体验的一部分
- rem
  - 相对单位
  - 移动端的重要单位 px 不要用了 绝对的
      移动端 宽高不定的 rem（html font-size） vw/vh(viewport), em 相对单位
      使用相对单位，可以在所有设备上适配
      em 相对于自身的 font-size 等比例

- props    组件通信
  - 传递状态
  - 传递自定义事件
  - 直接解构
      const{
        todos, // 任务
        onAddTodo, // 添加
      } = props 单独结构 

-数据绑定
  - 变量 修改值
  - 数据状态
    - Data binding **数据**绑定 jsx 就是静态的
    {} 数据绑定
    - 数据和界面状态的统一
      - 界面由数据驱动的
      - 数据和界面状态的一致性
    - 响应式的

- vue 和react区别（**单向双向绑定**）
  - vue 好入门，api好用
  - react 倾向于原生JS 入门难
    - hooks ？
  - <input v-model="text" /> vue 双向绑定
      <input value ={text} onChange={() => setText(text);}>
  react 坚持 单向绑定