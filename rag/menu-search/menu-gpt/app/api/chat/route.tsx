// 流式输出
// AI SDK 中用于生成流式文本响应的核心函数，支持逐字输出、工具调用和异步处理
import { streamText } from 'ai';
// ai-sdk openai 调用方式
import { createOpenAI } from '@ai-sdk/openai';
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
})

export async function POST(request: Request) {
  try {
    // 获取用户发送的消息
    const { messages } = await request.json();
    
    // 使用 streamText 生成回复
    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      messages: messages,
      system: '你是一个回答有关菜谱方面的AI助手，请根据用户的问题提供准确、有帮助的回答。',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('聊天API错误:', error);
    return new Response('服务器内部错误', { status: 500 });
  }
}