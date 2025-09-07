import { config } from 'dotenv';
import { createCrawl, createCrawlOpenAI } from 'x-crawl';
import {
    join,
    dirname
} from 'path';
import {
    writeFile,
    mkdir
} from 'fs/promises';
config(); // 加载 .env 文件中的环境变量

// 设置 Puppeteer 环境变量
process.env.PUPPETEER_EXECUTABLE_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const crawlApp = createCrawl({
    maxRetry: 3,
    intervalTime: {
        max: 2000,
        min: 1000
    }
})
// AI 辅助
const crawlOpenAIApp = createCrawlOpenAI({
    clientOptions: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL
    },
    defaultModel: {
        chatModel: "gpt-4o"
    }
})

const writeJSONToFile = async (data, filename) => {
    const filePath = join(process.cwd(), filename);
    try {
        // 确保目录存在
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`数据已保存到: ${filePath}`);
    } catch (error) {
        console.error('写入文件发生错误', error);
    }
}

crawlApp
    .crawlPage('https://www.cnblogs.com')
    .then(async res => {
        const{
            page,
            browser
        }= res.data;
        const targetSelector = '#post_list';
        await page.waitForSelector(targetSelector);
        const highlyHTML = await page.$eval(targetSelector, (el) => el.innerHTML);
        console.log(highlyHTML);

        const request = await crawlOpenAIApp.parseElements(
            highlyHTML,
            `
              获取每一个.post-item元素里面的.post-item-title里的标题,
              .post-item-summary里的纯文本摘要,以JSON格式返回。如:
              [{
                "title": "找到合适的PHP异步方案",
                "content": "RegExp"
              }]
            `
        )
        await browser.close();
        writeJSONToFile(request, './data/posts.json');
    })

