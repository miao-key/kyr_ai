# Nest + langchain 实现AI接口
- NestJS 是一个基于 TypeScript 的后端框架，核心思想是依赖注入 + 模块化
- 大多数Agent都是跑在后端服务
    Nest + LangChain 开发api接口
- nest?
    nodejs + typescript 的最主流框架
    底层是express (轻量级)，
    提供了MVC 、DI（依赖注入Dependencies Injection）等架构特征

- 创建项目
    - MVC 在哪？
    后端的开发设计模式
    Model Server 数据操作，远程rpc调用
    View(前后端分离)
    Controller 控制器 参数的校验和逻辑
    module 会将Controller Service （providers）import 外部服务
    组合起来形成一个功能模块，
    适合企业级开发。
    - DI
    - 装饰器模式
    面向对象设计之一 
    函数或类快速通过装饰器 增强功力
    - resultful
    - 一切皆资源
    book(名词) + CURD (HTTP Method 动词)

