/**
 * chat 聊天
 * 
 */
const DEEPSEEK_CHAT_API_URL = 'https://api.deepseek.com/chat/completions';
const KIMI_CHAT_API_URL = 'https://api.kimi.com/v1/chat/completions';

export const chat = async (
    messages, 
    api_url = DEEPSEEK_CHAT_API_URL,
    api_key = import.meta.env.VITE_DEEPSEEK_API_KEY,
    model = 'deepseek-chat'
) => {
   try{
        const response = await fetch(api_url,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${api_key}`
            },
            body:JSON.stringify({
                model,
                messages,
                stream:false,
            })
        })
        const data = await response.json();
        return {
            code: 0,
            data:{
                role:'assistant',
                content:data.choices[0].message.content
            }
        }
   }catch(err){
    return {
        code: 0,
        msg: '出错了...'
    }
   }
};

export const kimiChat = async (messages) => {
    const res = await chat(
        messages,
        KIMI_CHAT_API_URL,
        import.meta.env.VITE_KIMI_API_KEY,
        'moonshot-v1-auto'
    )
    return res;
}

export const generateAvatar = async (text) => {
   // 设计prompt
   const prompt = `
   你是一个经验丰富的头像设计师，请根据用户提供的昵称和签名，设计一个符合用户身份的头像。
   用户的信息是${text}
   要求有个性，有设计感。
   `
}