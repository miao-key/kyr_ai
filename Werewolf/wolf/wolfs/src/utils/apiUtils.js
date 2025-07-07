// Moonshot API配置和调用函数
const MOONSHOT_API_KEY = import.meta.env.VITE_KIMI_API_KEY
const MOONSHOT_BASE_URL = 'https://api.moonshot.cn/v1'

export const callMoonshotAPI = async (messages, temperature = 0.7) => {
  try {
    const response = await fetch(`${MOONSHOT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages,
        temperature,
        max_tokens: 1000
      })
    })
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }
    
    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Moonshot API调用错误:', error)
    return '我需要思考一下...'
  }
}