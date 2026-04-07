import "dotenv/config";
import { get_encoding } from 'tiktoken';
import { 
    // CharacterTextSplitter
    RecursiveCharacterTextSplitter
 } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

// 日志文件
const logDocument = new Document({
    pageContent: `[2024-01-15 10:00:00] INFO: Application started
    [2024-01-15 10:00:05] DEBUG: Loading configuration file
    [2024-01-15 10:00:10] INFO: Database connection established
    [2024-01-15 10:00:15] WARNING: Rate limit approaching
    [2024-01-15 10:00:20] ERROR: Failed to process request
    [2024-01-15 10:00:25] INFO: Retrying operation
    [2024-01-15 10:00:30] SUCCESS: Operation completed
    [2026-01-10 14:30:00] INFO: 系统开始执行大规模数据迁移任务，本次迁移涉及核心业务数据库中的所有用户数据。的hi殴打阿道夫哈维为哦发我欧虎哈哈好好地、发哦哈，爱护派发啊发发爱菲佛核对和法尔安抚哈U盘饿哦发哈US发的发放和啊大富豪分配？爱疯啊啊的发，而该东方哈哈反扑嗯哼哼佛奥首批合法都放假安排大姐夫事件符的胡搜啊收到货哈师大涉及到覅感受到，煽风点火方式符合哦圣诞节警示牌黄东萍色导航否适配公婆色是滴哦平均数第三个是视频，哈双方各咖啡爱上覅OA无返回奥拉夫hi好玩if按孵化和佛啊阿佛号发哈地方安徽佛号和偶发爱好。
    `
});

const logSplitter = new RecursiveCharacterTextSplitter({
    separators: ["\n","。","？","!","，"],
    chunkSize: 200,
    chunkOverlap: 20,
});

const logChunks = await logSplitter.splitDocuments([logDocument]);
console.log(logChunks);

const enc = get_encoding("cl100k_base");
logChunks.forEach(doc => {
    console.log(doc);
    console.log('character length', doc.pageContent.length);
    console.log('token length', enc.encode(doc.pageContent).length);
})