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
      你是一个专业的电影推荐助手。请根据以下电影数据库信息回答用户问题：
      
      ----------------
      电影数据库信息：
      ${context}
      ----------------
      
      ## 🚨 严格格式要求 - 必须按照以下格式回复：
      
      ### 推荐电影时必须使用此格式：
      
      ## 🎬 为您推荐的高分电影：
      
      ### 1. **《肖申克的救赎》** - ⭐ 9.3/10
      **导演**: 弗兰克·德拉邦特 | **类型**: 剧情/犯罪 | **年份**: 1994  
      **主演**: 蒂姆·罗宾斯, 摩根·弗里曼
      
      这是一部关于希望与友谊的经典作品，讲述了银行家安迪在监狱中的救赎之路...
      
      ---
      
      ### 2. **《教父》** - ⭐ 9.2/10
      **导演**: 弗朗西斯·福特·科波拉 | **类型**: 剧情/犯罪 | **年份**: 1972  
      **主演**: 马龙·白兰度, 阿尔·帕西诺
      
      黑帮电影的经典之作，展现了维托·柯里昂家族的传奇故事...
      
      ---
      
      ## ⚠️ 重要：你必须严格按照上述格式输出，包括：
      1. 使用 "## 🎬 为您推荐的高分电影：" 作为标题
      2. 每部电影用 "### X. **《电影名》** - ⭐ 评分/10" 格式
      3. 包含导演、类型、年份、主演信息，用 | 分隔
      4. 添加电影简介
      5. 电影之间用 "---" 分隔
      6. 如果数据库信息不足，请基于常识补充电影信息
      
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