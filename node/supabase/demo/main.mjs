import {
    supabase
} from './lib/supabaseClient.mjs'
// Backend as service
// 异步，node
// const {data, error} = await supabase.from("todos").insert({
//     title: "从0-1开发一个AI应用",
//     is_complete: false  // 注意字段名是 is_complete，不是 completed
// })
// if (error) {
//     console.log('插入失败:', error);
// } else {
//     console.log('插入成功:', data);
// }

const {data, error} = await supabase.from("todos").select("*")
console.log(data);