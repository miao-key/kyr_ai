// Moonshot API配置和调用函数
const MOONSHOT_API_KEY = import.meta.env.VITE_KIMI_API_KEY
const MOONSHOT_BASE_URL = 'https://api.moonshot.cn/v1'

// 增强的API调用函数
export const callMoonshotAPI = async (messages, temperature = 0.7, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!MOONSHOT_API_KEY) {
        throw new Error('API_KEY_MISSING')
      }
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
      
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
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP_${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      return data.choices[0].message.content
      
    } catch (error) {
      console.warn(`API调用失败 (尝试 ${attempt}/${retries}):`, error.message)
      
      // 最后一次尝试失败，返回智能降级回复
      if (attempt === retries) {
        return getIntelligentFallback(error, messages)
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}

// 智能降级回复
const getIntelligentFallback = (error, messages) => {
  const lastMessage = messages[messages.length - 1]?.content || ''
  
  if (error.message.includes('API_KEY_MISSING')) {
    return '系统配置问题，请检查API密钥设置'
  }
  
  if (error.message.includes('401')) {
    return 'API认证失败，请检查密钥是否正确'
  }
  
  if (error.message.includes('429')) {
    return '请求过于频繁，请稍后再试'
  }
  
  // 根据上下文返回合理的默认回复
  if (lastMessage.includes('投票')) {
    return '我需要仔细考虑投票选择...'
  }
  
  if (lastMessage.includes('发言')) {
    return '让我分析一下当前局势...'
  }
  
  return '我需要思考一下当前的策略...'
}