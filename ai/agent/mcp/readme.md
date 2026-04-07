# MCP

- llm with tools
    
    read write listDir exec tool
    llm + tools = Agent
    甜头 llm 真的能干活了

  - mini-cursor
      llm with tools 不太满意?
      怎么把llm 能干活的甜头扩大？ 更多的tools,更好的tool，第三方的tool,
      向外提供tool 大厂将自己的服务以mcp的方式向外提供
      - 80%的App 会消失
      - 集成第三方mcp 服务，mcp其实就是tool
      - node 调用 java/python/rust 等其他语言的tool

## MCP
Model Context Protocol Anthropic
在大量的将本地,跨语言、第三方的tool 集成到Agent里来的时候，让llm 强大的同时，也会带来一定的复杂性（对接联调）
大家都按一个约定来

## 按MCP 协议来开发，将我们的服务或资源 输出出去

## MCP 协议 还有通信部分
    - stdio 本地命令行
    - http 远程调用

## MCP 最大的特点就是可以跨进程调用工具
    - 子进程 node:child-process
    - 跨进程 java/rust
    - 远程进程
    llm 干更强大的任务
    繁杂（本地、跨语言、跨部门、远程）不同的通信方式（stdio,http）
    规范的提供工具和资源，mcp 协议 

## 编写满足mcp协议规范的Tool

- Model Context Protocol
    tool result , ToolMessage Context 上下文
- Anthropic 24 年底 25底 贡献给开源社区
- sdk @modelcontextprotocol/sdk

- 为什么mcp 需要配置？
    - cursor/trea 编程Agent 支持MCP client
    - 读取mcp.json 需要的mcp tool
    - 手写 MCP tool
        - Client/Server 架构
        - tool 的基础上加上MCP 规范
        - tool 需要一个server 容器 @modelcontextprotocol/mcp/server... 提供
        - refisterTool
        - connect transport

## mcp 三者关系

- mcp hosts
    cursor/vite Agent host
- mcp clients
    mcp 规范的tools
- mcp server
    mcp tool 运行的服务器容器

- 工作流程
  - MCP hosts 配置文件 SDD
  - initialize 发送一起请求
      得到mcp server 提供的tools 列表和详情
  - host prompt 任务
  - 检索 mcp 配置文件
  - client tool 通信方式
  - mcp server 执行并返回结果
  - llm ToolMessage

## MCP 开发流程
- new McpServer 创建了mcp server 实例
- server.register  Tool/Resource/Prompt 名字，描述，函数
- 通信方式 StdioServerTransport HttpServerTransport 
- server.connect(transport)
- host mcp 配置

## mcp 直接入住Agent 程序

- 怎么把mcp tools 集成到程序里面？
    mcp 是可拔插的  