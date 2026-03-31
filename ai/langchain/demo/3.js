import 'dotenv/config';
import {
    ChatDeepSeek
} from '@langchain/deepseek';
import {
    PromptTemplate
} from '@langchain/core/prompts';
// AI 应用的编程方式
// LLM 黑盒 打开 key prompt
// langchain ai 应用工程化
import {
    RunnableSequence
} from '@langchain/core/runnables';

const model = new ChatDeepSeek({
    model: 'deepseek-reasoner',
    temperature: 0.7
})

const explainPrompt = PromptTemplate.fromTemplate(`
  你是一个前端专家，请详细介绍以下概念：{topic}
  要求：覆盖定义，原理，使用方法，不超过300字。
`)

const summaryPrompt = PromptTemplate.fromTemplate(`
  请将以下前端概念解释总结为3个核心要点（每点不超过20字）：
  {explanation}
`)

const explainChain = explainPrompt.pipe(model);
console.log(explainChain);
const summaryChain = summaryPrompt.pipe(model);