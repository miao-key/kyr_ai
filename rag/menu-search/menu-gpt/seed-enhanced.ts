// 增强版菜谱知识库种子文件
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

// 定义菜谱数据类型
interface Recipe {
    title: string;
    cuisine_type: string;
    prep_time: number;      // 准备时间（分钟）
    cook_time: number;      // 烹饪时间（分钟）
    servings: number;       // 份数
    difficulty: string;     // 难度等级
    ingredients: string[];  // 原料列表
    instructions: string[]; // 制作步骤
    description: string;    // 菜谱描述
}

interface RecipeDatabase {
    popular_recipes: Recipe[];
    categories: Record<string, string[]>;    // 菜品分类
    recommendations: Record<string, string[]>; // 推荐菜谱
}

// 处理结构化菜谱数据
const processRecipeDatabase = async () => {
    const recipeDbPath = path.join(__dirname, 'recipe-database.json');
    const recipeData: RecipeDatabase = JSON.parse(fs.readFileSync(recipeDbPath, 'utf8'));
    
    // 处理热门菜谱
    for (const recipe of recipeData.popular_recipes) {
        const content = `菜品名称: ${recipe.title}
菜系类型: ${recipe.cuisine_type}
准备时间: ${recipe.prep_time}分钟
烹饪时间: ${recipe.cook_time}分钟
总耗时: ${recipe.prep_time + recipe.cook_time}分钟
份数: ${recipe.servings}人份
难度等级: ${recipe.difficulty}
主要原料: ${recipe.ingredients.join(', ')}
制作步骤: ${recipe.instructions.join(' ')}
菜品简介: ${recipe.description}`;
        
        await embedAndStore(content, `recipe-db-${recipe.title.replace(/\s+/g, '-').toLowerCase()}`);
    }
    
    // 处理分类推荐
    for (const [category, recipes] of Object.entries(recipeData.categories)) {
        const content = `菜品分类: ${category}
推荐菜谱: ${recipes.join(', ')}
这些是${category}类型的经典菜品。`;
        
        await embedAndStore(content, `category-${category}`);
    }
    
    // 处理推荐列表
    for (const [type, recipes] of Object.entries(recipeData.recommendations)) {
        const content = `推荐类型: ${type}
推荐菜谱: ${recipes.join(', ')}
这些是${type}类型的推荐菜谱。`;
        
        await embedAndStore(content, `recommendation-${type}`);
    }
}

// 优化后的网页内容提取
const scrapePage = async (url: string): Promise<string> => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
        gotoOptions: {
            waitUntil: 'domcontentloaded', // 改为更宽松的等待条件
            timeout: 45000, // 增加到45秒超时
        },
        evaluate: async (page, browser) => {
            try {
                // 等待页面完全加载
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // 等待主要内容加载
                await page.waitForSelector('body', { timeout: 10000 }).catch(() => {});
                
                const result = await page.evaluate(() => {
                    try {
                        // 简化的内容提取，避免复杂操作
                        let content = '';
                        
                        // 尝试获取主要内容区域
                        const mainSelectors = [
                            'main',
                            '[role="main"]',
                            '.main-content',
                            '#main',
                            '.content',
                            'article'
                        ];
                        
                        let mainElement = null;
                        for (const selector of mainSelectors) {
                            mainElement = document.querySelector(selector);
                            if (mainElement) break;
                        }
                        
                        if (!mainElement) {
                            mainElement = document.body;
                        }
                        
                        // 获取文本内容，避免复杂的DOM操作
                        content = mainElement.textContent || (mainElement as any).innerText || '';
                        
                        // 高级内容清理和过滤
                        content = content
                            // 基本空白处理
                            .replace(/\s+/g, ' ')
                            .trim()
                            // 移除HTML标签和属性
                            .replace(/<[^>]*>/g, '')
                            .replace(/srcset="[^"]*"/gi, '')
                            .replace(/sizes="[^"]*"/gi, '')
                            .replace(/src="[^"]*"/gi, '')
                            .replace(/width="[^"]*"/gi, '')
                            .replace(/height="[^"]*"/gi, '')
                            .replace(/class="[^"]*"/gi, '')
                            .replace(/id="[^"]*"/gi, '')
                            // 移除图片和媒体相关
                            .replace(/alt="[^"]*"/gi, '')
                            .replace(/https?:\/\/[^\s]+/gi, '')
                            .replace(/\b\d+w\b|\b\d+px\b/gi, '')
                            // 移除摄影师/造型师信息
                            .replace(/Food Styling:[^.]*\./gi, '')
                            .replace(/Prop Styling:[^.]*\./gi, '')
                            .replace(/Photography:[^.]*\./gi, '')
                            .replace(/Dotdash Meredith Food Studio/gi, '')
                            // 移除版权和署名信息
                            .replace(/Photo by [^.]*\./gi, '')
                            .replace(/Recipe by [^.]*\./gi, '')
                            // 移除广告和订阅相关内容
                            .replace(/Subscribe|Newsletter|Advertisement|Sign up/gi, '')
                            // 移除导航和UI元素
                            .replace(/Click here|Read more|Learn more|See all/gi, '')
                            .replace(/Jump to Recipe|Print Recipe|Save Recipe/gi, '')
                            // 移除评分和评论提示
                            .replace(/Rate this recipe|Write a review|Leave a comment/gi, '')
                            .replace(/\d+\s*Ratings?/gi, '')
                            // 移除社交分享
                            .replace(/Share on|Pin it|Tweet|Facebook/gi, '')
                            // 移除CSS类名和样式
                            .replace(/\.[a-zA-Z][\w-]*\s*\{[^}]*\}/gi, '')
                            // 移除很短的无意义片段（少于30个字符的句子）
                            .split('.').filter(sentence => sentence.trim().length > 30).join('.');
                        
                        return content;
                    } catch (err) {
                        console.error('页面评估内部错误:', err);
                        return '';
                    }
                });
                
                await browser.close();
                return result;
            } catch (error) {
                console.error('页面评估错误:', error);
                await browser.close();
                return '';
            }
        }
    });
    
    const rawContent = await loader.scrape();
    return cleanAndValidateContent(rawContent);
}

// 内容清理和验证函数
const cleanAndValidateContent = (content: string): string => {
    // 进一步清理内容，专门针对菜谱网站
    let cleanedContent = content
        .replace(/\{[^}]*\}/g, '')              // 移除模板语法 {{}}
        .replace(/\[[^\]]*\]/g, '')             // 移除链接语法 [[]]
        .replace(/==+\s*.*?\s*==+/g, '')       // 移除章节标题标记
        .replace(/\*+\s*/g, '')                // 移除列表标记
        .replace(/#\s*/g, '')                  // 移除编号标记
        .replace(/\|[^|]*\|/g, '')             // 移除表格分隔符
        .replace(/\s*\n\s*/g, ' ')             // 替换换行为空格
        .replace(/\s{2,}/g, ' ')               // 合并多余空格
        // 移除网站通用无用文本
        .replace(/Get Help|Customer Service|Contact Us|About Us|FAQ/gi, '')
        .replace(/Your Subscription|Give a Gift|Newsletter/gi, '')
        .replace(/View All|See More|Load More|Continue Reading/gi, '')
        .replace(/width="\d+"|height="\d+"|class="[^"]*"/gi, '') // 移除HTML属性
        .replace(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g, '') // 移除日期格式
        .replace(/^\s*\..*?st\d+.*?\n/gm, '')  // 移除CSS样式行
        // 新增：移除摄影师和造型师信息
        .replace(/Food Styling:[^.]*\./gi, '')
        .replace(/Prop Styling:[^.]*\./gi, '')
        .replace(/Photography:[^.]*\./gi, '')
        .replace(/Photo by [^.]*\./gi, '')
        .replace(/Dotdash Meredith Food Studio/gi, '')
        // 移除图片和媒体相关
        .replace(/alt="[^"]*"/gi, '')
        .replace(/srcset="[^"]*"/gi, '')
        .replace(/sizes="[^"]*"/gi, '')
        .replace(/https?:\/\/[^\s]+/gi, '')
        .replace(/\b\d+w\b|\b\d+px\b/gi, '')
        // 移除评分和评论提示
        .replace(/Rate this recipe|Write a review|Leave a comment/gi, '')
        .replace(/\d+\s*stars?|\d+\s*out of\s*\d+/gi, '')
        .replace(/\d+\s*Ratings?/gi, '')
        // 移除导航和UI元素
        .replace(/Jump to Recipe|Print Recipe|Save Recipe/gi, '')
        .replace(/Show Full Nutrition Label/gi, '')
        .trim();
    
    // 验证内容质量
    if (cleanedContent.length < 200) {  // 提高最小长度要求
        console.warn('警告: 提取的内容过短，可能质量较低');
        return '';
    }
    
    // 检查是否包含有用的菜谱相关关键词
    const recipeKeywords = [
        'recipe', 'ingredient', 'cook', 'bake', 'fry', 'boil', 'steam', 'grill',
        'preparation', 'serve', 'dish', 'cuisine', 'flavor', 'taste', 'spice',
        'minute', 'hour', 'tablespoon', 'teaspoon', 'cup', 'ounce', 'pound',
        'salt', 'pepper', 'oil', 'butter', 'garlic', 'onion', 'meat', 'vegetable',
        'calories', 'nutrition', 'protein', 'carbs', 'fat', 'fiber'
    ];
    
    const hasRecipeContent = recipeKeywords.some(keyword => 
        cleanedContent.toLowerCase().includes(keyword)
    );
    
    if (!hasRecipeContent) {
        console.warn('警告: 内容似乎不包含菜谱相关信息');
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
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`处理数据块 ${i + 1} 时出错:`, errorMessage);
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
    // 处理所有网页，不再限制数量
    console.log(`开始处理 ${webpages.length} 个网页...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < webpages.length; i++) {
        const url = webpages[i];
        console.log(`\n🌐 正在处理第 ${i + 1}/${webpages.length} 个网页: ${url}`);
        
        try {
            // 添加更详细的错误处理
            const content = await Promise.race([
                scrapePage(url).catch(err => {
                    console.error(`scrapePage错误详情:`, err);
                    throw err;
                }),
                new Promise<string>((_, reject) => 
                    setTimeout(() => reject(new Error('页面加载超时 (45秒)')), 45000)
                )
            ]);
            
            if (content && content.length > 200) {
                console.log(`✅ 成功提取内容，长度: ${content.length} 字符`);
                await embedAndStore(content, url);
                successCount++;
                console.log(`   ✓ 已存储到向量数据库`);
            } else {
                console.warn(`⚠️  内容太短或为空，跳过: ${url}`);
                errorCount++;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error(`❌ 处理网页 ${url} 时出错:`, errorMessage);
            if (errorStack) {
                console.error('错误堆栈:', errorStack);
            }
            errorCount++;
            continue; // 继续处理下一个网页
        }
        
        // 在处理网页之间添加延迟，避免被封IP
        if (i < webpages.length - 1) {
            console.log('⏱️  等待3秒后继续...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    console.log(`\n📊 网页处理完成: 成功 ${successCount}/${webpages.length} 个，失败 ${errorCount} 个`);
}

// 主函数
const buildRecipeKnowledgeBase = async () => {
    console.log('开始构建菜谱知识库...');
    
    // 1. 处理结构化菜谱数据
    console.log('处理结构化菜谱数据...');
    await processRecipeDatabase();
    
    // 2. 处理菜谱网站页面
    console.log('处理菜谱网站页面...');
    // 只保留可以成功爬取的AllRecipes网页（4个有效URL）
    await loadWebData([
        // ✅ 成功爬取的菜谱 - 简易肉饼（17,898字符，23个数据块）
        "https://www.allrecipes.com/recipe/16354/easy-meatloaf/",
        
        // ✅ 成功爬取的菜谱 - 餐厅风格炒饭（15,554字符，20个数据块）
        "https://www.allrecipes.com/recipe/79543/fried-rice-restaurant-style/",
        
        // ✅ 成功爬取的菜谱 - 汽水蛋糕（7,790字符，10个数据块）
        "https://www.allrecipes.com/recipe/22918/pop-cake/",
        
        // ✅ 成功爬取的菜谱 - 基础肉酱千层面（13,449字符，17个数据块）
        "https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/",
    ]);
    
    console.log('\n🎉 菜谱知识库构建完成！');  
    console.log('📊 成功处理:');
    console.log('   - 结构化菜谱数据: 10个中文菜谱 + 推荐分类');
    console.log('   - AllRecipes网页: 4个有效英文菜谱');
    console.log('   - 总计数据块: ~70个高质量菜谱片段');
}

// 运行
buildRecipeKnowledgeBase();
