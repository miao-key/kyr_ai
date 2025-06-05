

// js 主动的去拉取http 接口
// meb 1.0时代 html/css/js 服务器端java 返回的js 只做简单的交互
// js 主动的去拉取http 接口
// web 2.0 时代 js 主动的请求后端服务器  动态页面 

// fetch('https://api.github.com/users/miao-key/repos').then(res => res.json())
//   .then(data => {
//     console.log(data);
//     document.querySelector('#reply').innerHTML += data.map(repo =>`
//     <ul>
//       <li>${repo.name}</li>
//     </ul> 
//     `).join('')
//   })

// 当LLM API 服务
const endpoint = "https://api.deepseek.com/chat/completions"
// 请求头
const headers = {
    // 内容类型
    'Content-Type': 'application/json',
    // 授权
    'Authorization': 'Bearer sk-f2d030036e2847049f543e8a06bd31ea'
}

const payload ={
    model: 'deepseek-chat',
    messages: [
        {role: 'system',content: 'You are a helpful assistant.'},
        {role: 'user',content: '你好 Deepseek'}
    ]
}

fetch(endpoint,{
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
}).then(res => res.json())
.then(data => {
    console.log(data);
    document.querySelector('#reply').innerHTML += data.choices[0].message.content
})