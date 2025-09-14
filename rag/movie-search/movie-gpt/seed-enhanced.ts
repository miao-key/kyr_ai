// 增强版电影知识库种子文件
import { createOpenAI } from "@ai-sdk/openai";
import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { embed } from "ai"
import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL??"",
  process.env.SUPABASE_KEY??"",
)

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,  // 增加块大小，减少碎片化
    chunkOverlap: 200, // 适当增加重叠，保持上下文
});

// 定义电影数据类型
interface Movie {
    title: string;
    year: number;
    imdb_rating: number;
    genres: string[];
    director: string;
    description: string;
}

interface MovieDatabase {
    high_rated_movies: Movie[];
    categories: Record<string, string[]>;
    recommendations: Record<string, string[]>;
}

// 处理结构化电影数据
const processMovieDatabase = async () => {
    const movieDbPath = path.join(__dirname, 'movie-database.json');
    const movieData: MovieDatabase = JSON.parse(fs.readFileSync(movieDbPath, 'utf8'));
    
    // 处理高评分电影
    for (const movie of movieData.high_rated_movies) {
        const content = `电影名称: ${movie.title}
年份: ${movie.year}
IMDb评分: ${movie.imdb_rating}
类型: ${movie.genres.join(', ')}
导演: ${movie.director}
简介: ${movie.description}`;
        
        await embedAndStore(content, `movie-db-${movie.title.replace(/\s+/g, '-').toLowerCase()}`);
    }
    
    // 处理分类推荐
    for (const [category, movies] of Object.entries(movieData.categories)) {
        const content = `电影分类: ${category}
推荐电影: ${movies.join(', ')}
这些是${category}类型的优秀电影作品。`;
        
        await embedAndStore(content, `category-${category}`);
    }
    
    // 处理推荐列表
    for (const [type, movies] of Object.entries(movieData.recommendations)) {
        const content = `推荐类型: ${type}
推荐电影: ${movies.join(', ')}
这些是${type}类型的推荐电影。`;
        
        await embedAndStore(content, `recommendation-${type}`);
    }
}

// 优化后的网页内容提取
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
            const result = await page.evaluate(() => {
                // 只提取主要文章内容
                const mainContent = document.querySelector('#mw-content-text .mw-parser-output');
                if (!mainContent) {
                    // 备用选择器
                    const bodyContent = document.querySelector('#bodyContent');
                    if (bodyContent) return bodyContent.textContent || '';
                    return document.body.textContent || '';
                }
                
                // 创建内容副本进行清理
                const contentClone = mainContent.cloneNode(true) as Element;
                
                // 移除不需要的元素
                const removeSelectors = [
                    '.navbox',           // 导航框
                    '.infobox',          // 信息框(保留，因为包含电影信息)
                    '.reflist',          // 参考文献
                    '.catlinks',         // 分类链接
                    '.mw-editsection',   // 编辑链接
                    '.thumbcaption',     // 图片说明
                    '.gallery',          // 图片库
                    '.toc',              // 目录
                    '.navbox-group',     // 导航组
                    '.sidebar',          // 侧边栏
                    '.hatnote',          // 帽子注释
                    '.ambox',            // 消息框
                    '.metadata',         // 元数据
                    'style',             // 样式标签
                    'script',            // 脚本标签
                    '.citation',         // 引用
                    '.reference',        // 参考
                    '.external',         // 外部链接
                    'sup.reference',     // 上标参考
                    '.mw-cite-backlink', // 引用返回链接
                ];
                
                removeSelectors.forEach(selector => {
                    contentClone.querySelectorAll(selector).forEach(el => el.remove());
                });
                
                // 获取清理后的文本内容
                let text = contentClone.textContent || '';
                
                // 清理多余的空白和特殊字符
                text = text
                    .replace(/\s+/g, ' ')                    // 多个空白字符合并为一个
                    .replace(/\[\d+\]/g, '')                // 移除引用标记 [1], [2] 等
                    .replace(/\(\s*\)/g, '')                // 移除空括号
                    .replace(/[\u00A0\u2000-\u200B\u2028-\u2029\u202F\u205F\u3000]/g, ' ') // 移除特殊空白字符
                    .replace(/^\s+|\s+$/gm, '')             // 移除行首行尾空白
                    .replace(/\n\s*\n/g, '\n')              // 合并多个换行
                    .trim();
                
                return text;
            });
            await browser.close();
            return result;
        }
    });
    
    const rawContent = await loader.scrape();
    return cleanAndValidateContent(rawContent);
}

// 内容清理和验证函数
const cleanAndValidateContent = (content: string): string => {
    // 进一步清理内容
    let cleanedContent = content
        .replace(/\{[^}]*\}/g, '')              // 移除模板语法 {{}}
        .replace(/\[[^\]]*\]/g, '')             // 移除链接语法 [[]]
        .replace(/==+\s*.*?\s*==+/g, '')       // 移除章节标题标记
        .replace(/\*+\s*/g, '')                // 移除列表标记
        .replace(/#\s*/g, '')                  // 移除编号标记
        .replace(/\|[^|]*\|/g, '')             // 移除表格分隔符
        .replace(/\s*\n\s*/g, ' ')             // 替换换行为空格
        .replace(/\s{2,}/g, ' ')               // 合并多余空格
        .trim();
    
    // 验证内容质量
    if (cleanedContent.length < 100) {
        console.warn('警告: 提取的内容过短，可能质量较低');
        return '';
    }
    
    // 检查是否包含有用的电影相关关键词
    const movieKeywords = [
        'film', 'movie', 'director', 'actor', 'actress', 'plot', 'cast',
        'production', 'release', 'box office', 'review', 'rating', 'award',
        'cinema', 'genre', 'screenplay', 'starring', 'produced'
    ];
    
    const hasMovieContent = movieKeywords.some(keyword => 
        cleanedContent.toLowerCase().includes(keyword)
    );
    
    if (!hasMovieContent) {
        console.warn('警告: 内容似乎不包含电影相关信息');
        return '';
    }
    
    return cleanedContent;
}

// 优化的向量化并存储函数
const embedAndStore = async (content: string, source: string) => {
    // 验证内容是否有效
    if (!content || content.trim().length < 50) {
        console.warn(`跳过无效内容，来源: ${source}`);
        return;
    }
    
    const chunks = await splitter.splitText(content);
    console.log(`为 ${source} 创建了 ${chunks.length} 个数据块`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // 跳过过短的块
        if (chunk.trim().length < 30) {
            console.warn(`跳过过短的数据块 ${i + 1}`);
            continue;
        }
        
        try {
            const {embedding} = await embed({
                model: openai.embedding('text-embedding-3-small'),
                value: chunk
            });
            
            const {error} = await supabase.from('chunks').insert({
                content: chunk,
                embedding: embedding, 
                url: source
            });
            
            if(error) {
                console.error(`插入数据块 ${i + 1} 失败:`, error);
                errorCount++;
            } else {
                successCount++;
                console.log(`✅ 成功插入数据块 ${i + 1}/${chunks.length}: ${chunk.substring(0, 50)}...`);
            }
        } catch (err) {
            console.error(`处理数据块 ${i + 1} 时出错:`, err);
            errorCount++;
        }
        
        // 添加小延迟避免API限制
        if (i % 10 === 9) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log(`📊 ${source} 处理完成: 成功 ${successCount} 个，失败 ${errorCount} 个`);
}

// 处理网页数据
const loadWebData = async (webpages: string[]) => {
    console.log(`开始处理 ${webpages.length} 个网页...`);
    
    for (let i = 0; i < webpages.length; i++) {
        const url = webpages[i];
        console.log(`\n🌐 正在处理第 ${i + 1}/${webpages.length} 个网页: ${url}`);
        
        try {
            const content = await scrapePage(url);
            
            if (content && content.length > 0) {
                console.log(`📝 提取到 ${content.length} 字符的内容`);
                await embedAndStore(content, url);
            } else {
                console.warn(`⚠️  未能从 ${url} 提取到有效内容`);
            }
        } catch (error) {
            console.error(`❌ 处理网页 ${url} 时出错:`, error);
            continue; // 继续处理下一个网页
        }
        
        // 在处理网页之间添加延迟，避免被封IP
        if (i < webpages.length - 1) {
            console.log('⏱️  等待3秒后继续...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    console.log('\n🎉 所有网页处理完成！');
}

// 主函数
const buildMovieKnowledgeBase = async () => {
    console.log('开始构建电影知识库...');
    
    // 1. 处理结构化电影数据
    console.log('处理结构化电影数据...');
    await processMovieDatabase();
    
    // 2. 处理维基百科电影页面
    console.log('处理维基百科电影页面...');
    await loadWebData([
        // 经典高分电影
        "https://en.wikipedia.org/wiki/The_Shawshank_Redemption",
        "https://en.wikipedia.org/wiki/The_Godfather",
        "https://en.wikipedia.org/wiki/The_Dark_Knight",
        "https://en.wikipedia.org/wiki/Pulp_Fiction",
        
        // 现代佳作
        "https://en.wikipedia.org/wiki/Parasite_(2019_film)",
        "https://en.wikipedia.org/wiki/Inception",
        "https://en.wikipedia.org/wiki/Interstellar_(film)",
        
        // 动画电影
        "https://en.wikipedia.org/wiki/Spirited_Away",
        "https://en.wikipedia.org/wiki/Spider-Man:_Into_the_Spider-Verse",
        
        // 电影排行榜
        "https://en.wikipedia.org/wiki/IMDb_Top_250",
        "https://en.wikipedia.org/wiki/AFI%27s_100_Years...100_Movies",
    ]);
    
    console.log('电影知识库构建完成！');
}

// 运行
buildMovieKnowledgeBase();
