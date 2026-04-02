import express from 'express'; // 引入后端框架
import cors from 'cors'; // 引入跨域模块
// langchain 支持ollama
import { ChatOllama } from '@langchain/ollama';
// 提示词模板
import  { ChatPromptTemplate } from '@langchain/core/prompts';
// 输出格式化模块
import {StringOutputParser} from '@langchain/core/output_parsers';
// web server http 协议 3000 伺服 路由

const model = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: "deepseek-r1:8b",
  temperature: 0.1, // 严格
})

const app = express(); // server app
// 使用 json 解析中间件服务
app.use(express.json());
// 跨域配置中间件
app.use(cors());

// 路由  get method path /hello
// req 请求对象 res 响应对象
app.get('/hello', (req, res) => {
  res.send('Hello World');
})

app.post('/chat',async (req, res) => {
    //处理函数
  console.log(req.body,'////')
  const {message} = req.body; // 请求体里解构用户的提问
  // 后端稳定第一
  if (!message || typeof message !== 'string') {
    // 响应头 statusCode 400 用户请求错误
    // 响应体是json的
    // 完整的响应
    // send 文本 后端api服务数据接口格式是 json
    return res.status(400).json({
        error: "message 必填，必须是字符串"
    })
  }
  // 容错
  try{
    const prompt = ChatPromptTemplate.fromMessages([
      ['system','你是一个助理'],
      ['human','{input}']
    ])
    const chain = prompt
      .pipe(model)
      .pipe(new StringOutputParser());
    console.log('正在调用大模型');

    const result = await chain.invoke({
      input: message
    })
    res.json({
      replay: result
    })
  } catch(e){
    res.status(500).json({
      error: "调用大模型失败"
    })
  }
    // res.send(message);
})

app.listen(3000, () => {
    console.log('server is running on port 3000');
})
