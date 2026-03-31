import { ChatDeepSeek } from '@langchain/deepseek';
import 'dotenv/config';
import { tool } from '@langchain/core/tools';
import { z } from "zod"; // 用于定义工具的输入参数的类型

const fakeWeatherDB ={
  北京: { temp: "30°C", condition: "晴",wind: "微风" },
  上海: { temp: "28°C", condition: "多云",wind: "东风 3 级" },
  广州: { temp: "32°C", condition: "阵雨" ,wind: "南风 2 级"},
}

const weatherTool = tool(
  async ({ city }) => {
    const weather = fakeWeatherDB[city];
    if (!weather){
      return `暂无${city}的天气信息`
    }
    return `当前${city}的天气是${weather.temp}，${weather.condition}，风力${weather.wind}`
  },
  {
    name: "get_weather",
    description: "查询指定城市的今日天气情况",
    schema: z.object({
      city: z.string().describe("要查询天气的城市")
    })
  }
)
console.log(weatherTool);
// 函数 定义一个加法工具
const addTool = tool(
    // 两个参数
    // 等下大模型来调用
    // 参数 对象 解构a b
    async ({a, b}) => String(a + b),
    {
      name: "add",
      description: "计算两个数字的和",
      schema: z.object({
        a: z.number(),
        b: z.number()
      })
    }
)

const model = new ChatDeepSeek({
    model: 'deepseek-chat',
    temperature: 0,
}).bindTools([addTool, weatherTool]);

// const res = await model.invoke("3 + 5等于多少？");
// 可选链运算符 es6 新增  代码的简洁和优雅
// if (res.tool_calls) {
//     if (res.tool_calls.length) {

//     }
// }
const res = await model.invoke("上海今天的天气怎么样？");


if(res.tool_calls?.length) {
  // console.log(res.tool_calls[0]);
  if (res.tool_calls[0].name === "add") {
    const result = await addTool.invoke(res.tool_calls[0].args);
    console.log("最终结果：", result);
  } else if (res.tool_calls[0].name === "get_weather"){
    const result =await weatherTool.invoke(res.tool_calls[0].args);
    console.log("最终结果：", result);
  }
}
