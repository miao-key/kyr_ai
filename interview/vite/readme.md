# 工程化

- 哪些问题？ 工程一揽子方案
    - web server 5173 端口 http 模块？ express 框架
        index.html 首页
    - tsx -> jsx -> babel js
    - styl -> css 文件
    ....
    基础，后方工作
    
- 怎么介绍vite
    - 兼容性问题
        IE 11一下 不支持
     <script type="module" src="/src/main.js"></script>
    VITE是一个基于原生ES模块 (import 解析，Webpack, 浏览器很多还不支持esm)，
    通过按需编译实现极速冷启动（快）与热更新的新一代前端构建工具。

    - 快？
        - 基于原生ES模块，不需要打包所有文件，按需加载

    main.jsx 入口文件，模块的依赖
    main.js -> App.jsx ->App.css + react + components + router + api + store
    整理这些模块之间的依赖关系（链条）

- webpack
    由于要支持老旧浏览器，不使用esm,
    a->b->c->d
    不用模块化
    d 编译js 最上面
    c 编译 放到d下面
    b 放到 b 下面
    a 放到 b 下面
    一起打个包，成为一个文件