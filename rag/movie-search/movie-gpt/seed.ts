// supabase 去做向量化的知识库数据
import { createOpenAI } from "@ai-sdk/openai";
// langchain  loader 是 RAG的基础功能 txt,pdf,excel....
// 加载网页内容
import {
    PuppeteerWebBaseLoader
} from '@langchain/community/document_loaders/web/puppeteer'
import {
  RecursiveCharacterTextSplitter
} from 'langchain/text_splitter'
import {
  embed // 向量嵌入
} from "ai"
import "dotenv/config"
import {createClient} from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL??"",
  process.env.SUPABASE_KEY??"",
)
const  openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
})

console.log('开始向量化知识库数据');
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512, // 切割的长度 512 个字符 包含一个比较独立的语意
    chunkOverlap: 100, // 切割的重叠长度 100 个字符 一句话被切割容错
});

const scrapePage = async (url: string): Promise<string> => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true,
        },
        gotoOptions: {
            waitUntil: 'networkidle0',
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML);
            await browser.close();
            return result;
        }
    });
    // < - 匹配左尖括号（HTML标签开始）
    // [^>]* - 字符类，匹配除了 > 以外的任意字符，* 表示0个或多个
    // ^在
    // >? - 匹配右尖括号，? 表示0个或1个（可选）
    // /gm - 正则修饰符
    // g (global) - 全局匹配，不只匹配第一个
    // m (multiline) - 多行模式
    return (await loader.scrape()).replace(/<[^>]*>?/gm, "");
}
const loadData = async (webpages: string[]) => {
    for (const url of webpages) {
        const content = await scrapePage(url);
        // console.log(content);
        const chunks = await splitter.splitText(content);
        // console.log(chunks, '--------');
        for (let chunk of chunks) {
          const {embedding} = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: chunk
          })
          console.log(embedding, '--------');
          
          // 将插入操作移到循环内部，为每个chunk插入一条记录
          const {error} = await supabase.from('chunks').insert({
            content: chunk,
            embedding: embedding, 
            url: url
          })
          if(error) {
            console.log("Error inserting data into supabase", error);
          } else {
            console.log(`成功插入chunk: ${chunk.substring(0, 50)}...`);
          }
        }
    }
}

// 维护一个电影知识库，知识库的来源可配置
loadData([
    "https://en.wikipedia.org/wiki/Avengers:_Endgame",
    "https://en.wikipedia.org/wiki/The_Dark_Knight",
    "https://en.wikipedia.org/wiki/Inception",
    "https://en.wikipedia.org/wiki/Pulp_Fiction",
    "https://en.wikipedia.org/wiki/The_Godfather",
    "https://en.wikipedia.org/wiki/Interstellar_(film)",
    "https://en.wikipedia.org/wiki/The_Shawshank_Redemption",
    "https://en.wikipedia.org/wiki/Avatar_(2009_film)",
    // "https://en.wikipedia.org/wiki/Titanic_(1997_film)",
    // "https://en.wikipedia.org/wiki/The_Matrix",
    // "https://en.wikipedia.org/wiki/Star_Wars:_The_Force_Awakens",
    // "https://en.wikipedia.org/wiki/Black_Panther_(film)",
]);