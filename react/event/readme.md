# react 事件机制
- js 事件机制
    - 异步
    - 监听一个事件
      - addEventListener() DOM2  事件
      - DOM 0
      <a onclick="doSomething()"></a>
      - DOM 1? DOM 版本，没有去做事件的升级

    - addEventListener(type, listener，useCapture？)
    - 回调函数 callback 异步处理的称呼
    - promise then
    - async await
    监听器
- 注册事件 addEventListener
- useCapture false 默认值
    页面是浏览器渲染引擎按像素点画出来 png`
    先捕获 document -> 
        点了谁？
        先触发父元素
    event.target
        捕获阶段结束，拿到event.target
    冒泡
        event.target 冒泡到html 回去到根事件让他在冒泡阶段执行
        在哪个阶段执行
        当 useCapture = false（冒泡）-> 冒泡阶段 ：事件从目标元素开始，逐层向外传播到最外层元素
        当 useCapture = true（捕获） -> 捕获阶段 ：事件从最外层元素开始，逐层向内传播到目标元素

        
