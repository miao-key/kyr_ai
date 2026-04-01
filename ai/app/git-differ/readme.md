# Git 提交AI神器

- 需求
  - 规范的git 提交信息是很重要的
    - 项目的日志
    - 工作业绩的审核，leader 要看
    - 新手可以向高手一样高质量提交代码 （git 高级规范）

- 技术构成
  - 全栈项目
  - 前端 react + taillwindcss + axios
  - 后端 node express

- 前后端分离
  - server
    - 运行在服务器
    - 提供api 接口，3000 伺服

  - frontend
    在用户的浏览器上运行（v8引擎，js运行的宿主）
    http://localhost:5173  Web 

## express
- node 老牌的敏捷开发框架
- app 后端应用
-  listen 3000 端口伺服
- 后端路由 path
  网络本质是提供资源和服务的
  app.get('/hello'，() => {
  })
  http 是基于请求响应的简单协议
  http://localhost:3000
  ip 找到服务器
  端口对应的是应用 express
  path /hello 
  GET 资源的操作 CRUD
  req 请求对象 
  res 对象 响应对象

- GET 和 POST区别
  - GET 没有请求体，POST有
- 中间件
  app.use(express.json()) // 解析请求体的json 数据 
- 响应头、响应体
  - 1xx 请求中....
  - 200 OK 成功
  - 201 Created 成功创建资源
  - 3XX 重定向 redirect
  - 400 Bad Request 合适的状态码
  - 404 Not Found 资源不存在
  - 401 Unauthorized 未授权
  - 500 Internal Server Error 服务器错误
  
## 跨域
有风险
- 柬埔寨 跨域
  www.baidu.com(用户安全) -> www.dy.com
  http:// (协议) www.baidu.com(域名): 5173 (端口)
  - 同源策略 直接放弃请求 CORS Cross Origin Resource Sharing
  - 端口不一样 也会跨域 非常的严格
  协议、域名、端口 一样
  block 阻止请求
  - 解决跨域  日常问题 办护照