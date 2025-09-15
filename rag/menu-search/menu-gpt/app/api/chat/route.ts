import {
    embed,
    streamText
  } from 'ai';
  import {
    createOpenAI
  } from '@ai-sdk/openai';
import {
    createClient
} from "@supabase/supabase-js";
const supabase = createClient(
    process.env.SUPABASE_URL??"",
    process.env.SUPABASE_KEY??""
)
  
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
  })
  
  async function generateEmbedding(message: string) {
    return embed({
      model: openai.embedding('text-embedding-3-small'),
      value: message
    })
  }

  async function fetchRelevantContext(embedding: number[]) {
    const { 
      data,
      error 
    } = await supabase.rpc('get_relevant_chunks', {
      query_vector: embedding,
      match_threshold: 0.7,
      match_count: 3
    })
    if(error) throw error;
    console.log(data,'////////');
    return JSON.stringify(
      data.map((item: any) =>`
        Source: ${item.url},
        Date Updataed: ${item.date_updated},
        Content: ${item.content}
      `)
    );
  }

  const createPrompt = (context: string,userQuestion: string) => {
    return {
      role: 'system',
      content: `
      你是一个专业的菜谱推荐助手。请根据以下菜谱数据库信息回答用户问题：
      
      ----------------
      菜谱数据库信息：
      ${context}
      ----------------
      
      ## 🚨 严格格式要求 - 必须按照以下格式回复：
      
      ### 推荐菜谱时必须使用此格式：
      
      ## 🍽️ 为您推荐的美味菜谱：
      
      ### 1. **简易肉饼** - ⭐ 4.5/5
      **准备时间**: 15分钟 | **烹饪时间**: 45分钟 | **难度**: 简单 | **份数**: 6人份  
      **菜系**: 美式家常菜 | **主要食材**: 牛肉糜、洋葱、蛋
      
      这是一道经典的美式家常菜，制作简单，口感丰富，非常适合家庭聚餐...
      
      **主要步骤**：
      1. 预热烤箱至350°F
      2. 混合牛肉糜、洋葱丁和调料
      3. 烘烤45分钟至内部温度达165°F
      
      ---
      
      ### 2. **巧克力曲奇饼干** - ⭐ 4.7/5
      **准备时间**: 20分钟 | **烹饪时间**: 12分钟 | **难度**: 简单 | **份数**: 24块  
      **菜系**: 美式烘焙 | **主要食材**: 面粉、黄油、巧克力豆
      
      香甜可口的经典曲奇，制作简单，是下午茶的完美搭配...
      
      **主要步骤**：
      1. 混合干性材料
      2. 加入湿性材料制成面团
      3. 烘烤12分钟至边缘呈金黄色
      
      ---
      
      ## ⚠️ 重要：你必须严格按照上述格式输出，包括：
      1. 使用 "## 🍽️ 为您推荐的美味菜谱：" 作为标题
      2. 每道菜用 "### X. **菜品名** - ⭐ 评分/5" 格式
      3. 包含准备时间、烹饪时间、难度、份数、菜系、主要食材，用 | 分隔
      4. 添加菜品描述和主要制作步骤
      5. 菜谱之间用 "---" 分隔
      6. 如果数据库信息不足，请基于常识补充菜谱信息
      
      用户问题: ${userQuestion}
      `
    }
  }

  export async function POST(req: Request) {
    try {
      const { messages } = await req.json();
      const latestMessage = messages.at(-1).content;
      // embedding
      const { embedding } = await generateEmbedding(latestMessage);
      //console.log(embedding);
      // 相似度计算
      const context = await fetchRelevantContext(embedding);
      const prompt = createPrompt(context,latestMessage);
      console.log(prompt);
      const result = streamText({
        model: openai("gpt-4o-mini"),
        messages: [prompt,...messages],
        temperature: 0.7,
        maxTokens: 1000
      });
      return result.toDataStreamResponse();
    } catch(err) {
      throw err;
    }
  }