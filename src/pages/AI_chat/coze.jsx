import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTitle } from 'ahooks'
import useAuthStore from '@/stores/authStore'
import { UserAvatar } from '@/components/UI'
import { ApiConfig } from '@/utils/apiConfig'
import styles from './coze.module.css'

// 增强的Markdown格式化函数
const formatMessageContent = (content) => {
  // 第一步：先对整个内容进行预处理，清理明显的** pattern问题
  let cleanContent = content
    .replace(/\*\*([^*\n]*)\*\*([^：:])/g, '$1$2') // 清理**内容**后面不是：的情况
    .replace(/([^：:])\*\*([^*\n]*)\*\*/g, '$1$2') // 清理前面不是：的**内容**情况
  
  const lines = cleanContent.split('\n')
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim()
    
    // 处理各级标题
    if (trimmedLine.startsWith('##### ')) {
      return <h5 key={index} className={styles.heading5}>{trimmedLine.replace('##### ', '')}</h5>
    }
    if (trimmedLine.startsWith('#### ')) {
      return <h4 key={index} className={styles.heading4}>{trimmedLine.replace('#### ', '')}</h4>
    }
    if (trimmedLine.startsWith('### ')) {
      return <h3 key={index} className={styles.heading3}>{trimmedLine.replace('### ', '')}</h3>
    }
    if (trimmedLine.startsWith('## ')) {
      return <h2 key={index} className={styles.heading2}>{trimmedLine.replace('## ', '')}</h2>
    }
    if (trimmedLine.startsWith('# ')) {
      return <h1 key={index} className={styles.heading1}>{trimmedLine.replace('# ', '')}</h1>
    }
    
    // 处理分隔线
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      return <hr key={index} className={styles.divider} />
    }
    
    // 处理日期格式（如：今日（2025-08-05）：）
    if (trimmedLine.match(/^(今日|明日|后天|昨日)\s*[（(][^)）]*[)）]\s*[：:].*$/)) {
      return <div key={index} className={styles.dateLabel}>{formatInlineText(trimmedLine)}</div>
    }
    
    // 处理时间段标题（如：上午：抵达与早餐）
    if (trimmedLine.match(/^(上午|中午|下午|晚上|傍晚|清晨|夜晚)\s*[：:].+$/)) {
      const [period, ...content] = trimmedLine.split(/[：:]/)
      return (
        <div key={index} className={styles.periodWithContent}>
          <span className={styles.periodLabel}>{period}：</span>
          <span className={styles.periodContent}>{content.join('：')}</span>
        </div>
      )
    }
    
    // 处理特殊格式的时间项（如：上午：、中午：等）
    if (trimmedLine.match(/^(上午|中午|下午|晚上|傍晚|清晨|夜晚)\s*[：:]$/)) {
      return <div key={index} className={styles.periodLabel}>{trimmedLine}</div>
    }
    
    // 处理粗体键值对（如：**时间**：08:00 - 12:00） - 彻底清理版本
    if (trimmedLine.match(/^\*\*(时间|地点|活动|建议|交通|推荐菜品|酒店|地址|特色|费用|门票|开放时间)\*\*\s*[：:].+$/)) {
      const content = trimmedLine.replace(/^\*\*/, '').replace(/\*\*/, '')
      const [key, ...value] = content.split(/[：:]/)
      // 彻底清理键和值中的所有**字符
      const cleanKey = key.replace(/\*+/g, '')
      const cleanValue = value.join('：').replace(/\*+/g, '')
      return (
        <div key={index} className={styles.boldKeyValue}>
          <span className={styles.boldKey}>{cleanKey}：</span>
          <span className={styles.boldValue}>{formatInlineText(cleanValue)}</span>
        </div>
      )
    }
    
    // 处理普通键值对（如：地点：三清山风景区）
    if (trimmedLine.match(/^(日期|天气|风力|时间|地点|活动|建议|交通|推荐菜品|酒店|地址|特色|费用|门票|开放时间|衣物|雨具|防晒)\s*[：:].+$/)) {
      const [key, ...value] = trimmedLine.split(/[：:]/)
      return (
        <div key={index} className={styles.keyValuePair}>
          <span className={styles.keyLabel}>{key}：</span>
          <span className={styles.valueContent}>{formatInlineText(value.join('：'))}</span>
        </div>
      )
    }
    
    // 处理分类标题（如：经济型：、舒适型：、自驾：等）
    if (trimmedLine.match(/^(经济型|舒适型|豪华型|特色民宿|自驾|公共交通|包车|高铁|飞机)\s*[：:].+$/)) {
      const [category, ...content] = trimmedLine.split(/[：:]/)
      return (
        <div key={index} className={styles.categoryItem}>
          <span className={styles.categoryLabel}>{category}：</span>
          <span className={styles.categoryContent}>{formatInlineText(content.join('：'))}</span>
        </div>
      )
    }
    
    // 处理粗体日期标题（如：**第一天：2025年8月5日（星期二）**）
    if (trimmedLine.match(/^\*\*第[一二三四五六七八九十]+天.*\*\*$/)) {
      const content = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '')
      return <h2 key={index} className={styles.dayTitle}>{content}</h2>
    }
    
    // 处理粗体段落标题（如：**天气状况**、**行程规划**等）
    if (trimmedLine.match(/^\*\*(天气状况|行程规划|住宿推荐|交通建议|注意事项|推荐酒店|市内交通|其他建议|建议穿着|衣食住行建议)\*\*$/)) {
      const content = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '')
      return <h3 key={index} className={styles.sectionTitle}>{content}</h3>
    }
    
    // 处理粗体时间段标题（如：**上午：出发与抵达**、**下午：市区文化**等）
    if (trimmedLine.match(/^\*\*(上午|中午|下午|晚上|傍晚|清晨|夜晚)[：:].*\*\*$/)) {
      const content = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '')
      return <h4 key={index} className={styles.timePeriodTitle}>{content}</h4>
    }
    
    // 处理粗体纯时间格式（如：**07:00 - 09:00**、**12:00 - 13:30**等）
    if (trimmedLine.match(/^\*\*\d{1,2}:\d{2}\s*[-~]\s*\d{1,2}:\d{2}\*\*$/)) {
      const content = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '')
      return <h5 key={index} className={styles.timeRangeTitle}>{content}</h5>
    }
    
    // 处理普通段落标题（无**包围）
    if (trimmedLine.match(/^(天气状况|行程规划|住宿推荐|交通建议|注意事项|推荐酒店|市内交通|其他建议|建议穿着|衣食住行建议)$/)) {
      return <h3 key={index} className={styles.sectionTitle}>{trimmedLine}</h3>
    }
    
    // 处理带时间的列表项
    if (trimmedLine.startsWith('- ') && trimmedLine.includes(' - ') && trimmedLine.includes(':')) {
      const content = trimmedLine.replace('- ', '')
      const [timeRange, ...description] = content.split('：')
      return (
        <div key={index} className={styles.timeItem}>
          <span className={styles.timeLabel}>{timeRange}</span>
          <span className={styles.timeContent}>：{description.join('：')}</span>
        </div>
      )
    }
    
    // 处理粗体时间项（如 **时间**：内容 或 - **时间**：内容） - 彻底清理版本
    if ((trimmedLine.startsWith('**') || trimmedLine.startsWith('- **')) && trimmedLine.includes('**：')) {
      const content = trimmedLine.startsWith('- **') ? trimmedLine.replace('- **', '') : trimmedLine.replace(/^\*\*/, '')
      const [time, ...rest] = content.split('**：')
      // 彻底清理时间和内容中的所有**字符
      const cleanTime = time.replace(/\*+/g, '')
      const cleanContent = rest.join('：').replace(/\*+/g, '')
      return (
        <div key={index} className={styles.timeItem}>
          <span className={styles.timeLabel}>{cleanTime}</span>
          <span className={styles.timeContent}>：{formatInlineText(cleanContent)}</span>
        </div>
      )
    }
    
    // 处理数字列表项（如：1. 内容 或 1. 上午：）
    if (trimmedLine.match(/^\d+\.\s/)) {
      const content = trimmedLine.replace(/^\d+\.\s*/, '')
      const number = trimmedLine.match(/^(\d+)\./)[1]
      
      // 检查是否是时间段标记（如"上午："）
      if (content.match(/^(上午|中午|下午|晚上|傍晚|清晨|夜晚)\s*[：:]$/)) {
        return (
          <div key={index} className={styles.numberedTimeSection}>
            <span className={styles.listNumber}>{number}.</span>
            <span className={styles.timeSectionLabel}>{content}</span>
          </div>
        )
      }
      
      return (
        <div key={index} className={styles.numberedListItem}>
          <span className={styles.listNumber}>{number}.</span>
          <span className={styles.listContent}>{formatInlineText(content)}</span>
        </div>
      )
    }
    
    // 处理通用粗体标题（兜底方案：**任何内容**） - 彻底清理版本
    if (trimmedLine.match(/^\*\*[^*]+\*\*$/) && trimmedLine.length < 100) {
      const content = trimmedLine.replace(/^\*\*/, '').replace(/\*\*$/, '')
      // 彻底清理内容中的所有**字符
      const cleanContent = content.replace(/\*+/g, '')
      return <div key={index} className={styles.generalBoldTitle}>{cleanContent}</div>
    }
    
    // 处理项目符号列表项
    if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
      const content = trimmedLine.replace(/^[•-]\s*/, '')
      return <div key={index} className={styles.listItem}>• {formatInlineText(content)}</div>
    }
    
    // 处理空行
    if (trimmedLine === '') {
      return <div key={index} className={styles.emptyLine}></div>
    }
    
    // 处理普通文本（包含内联格式） - 最后的兜底清理
    const cleanLine = line.replace(/\*+/g, '') // 作为最后的保障，清理任何残留的*字符
    return <div key={index} className={styles.textLine}>{formatInlineText(cleanLine)}</div>
  })
}

// 处理内联文本格式（粗体、链接等） - 彻底清理版本
const formatInlineText = (text) => {
  if (typeof text !== 'string') return text
  
  let result = text
  
  // 第一步：保护地点标签【】
  const locationTags = []
  result = result.replace(/(【[^】]*】)/g, (match, tag) => {
    const index = locationTags.length
    locationTags.push(tag)
    return `__LOCATION_PLACEHOLDER_${index}__`
  })
  
  // 第二步：只处理完整且有效的粗体标记 **content**
  const boldContents = []
  result = result.replace(/\*\*([^*\n\r]+?)\*\*/g, (match, content) => {
    // 只有内容不为空且不包含特殊字符时才处理
    const trimmedContent = content.trim()
    if (trimmedContent.length > 0 && !trimmedContent.includes('*')) {
      const index = boldContents.length
      boldContents.push(trimmedContent)
      return `__BOLD_PLACEHOLDER_${index}__`
    }
    // 否则直接返回内容，去掉**
    return content
  })
  
  // 第三步：彻底清理所有剩余的** - 这是关键步骤
  result = result.replace(/\*{2,}/g, '') // 清理连续的**
  result = result.replace(/\*/g, '') // 清理单个*
  
  // 第四步：如果没有任何特殊标记，直接返回清理后的文本
  if (!result.includes('__BOLD_PLACEHOLDER_') && !result.includes('__LOCATION_PLACEHOLDER_')) {
    return result
  }
  
  // 第五步：重新组装为React元素
  const parts = result.split(/(__BOLD_PLACEHOLDER_\d+__|__LOCATION_PLACEHOLDER_\d+__)/)
  
  return parts.map((part, i) => {
    // 处理粗体占位符
    const boldMatch = part.match(/^__BOLD_PLACEHOLDER_(\d+)__$/)
    if (boldMatch) {
      const index = parseInt(boldMatch[1])
      return <strong key={`bold-${i}`} className={styles.boldText}>{boldContents[index]}</strong>
    }
    
    // 处理地点占位符
    const locationMatch = part.match(/^__LOCATION_PLACEHOLDER_(\d+)__$/)
    if (locationMatch) {
      const index = parseInt(locationMatch[1])
      return <span key={`location-${i}`} className={styles.locationTag}>{locationTags[index]}</span>
    }
    
    // 普通文本 - 再次确保没有**残留
    const cleanPart = part.replace(/\*+/g, '')
    return cleanPart || ''
  }).filter(part => part !== '')
}

const Coze = () => {
  useTitle('智旅-AI助手')
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  // 使用统一的认证系统
  const { user, isAuthenticated } = useAuthStore()

  // 获取API配置
  const apiConfig = new ApiConfig()
  const config = apiConfig.getCozeConfig()
  
  // Coze工作流API配置
  const workflow_id = '7534974379706794024'
  
  // localStorage键名
  const STORAGE_KEY = 'coze-chat-messages'
  
  // 从localStorage加载聊天记录
  const loadMessagesFromStorage = () => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY)
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages)
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages
        }
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error)
    }
    return null
  }
  
  // 保存聊天记录到localStorage
  const saveMessagesToStorage = (messages) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (error) {
      console.error('保存聊天记录失败:', error)
    }
  }
  
  // 清空聊天记录
  const clearChatHistory = () => {
    const welcomeMessage = {
      id: 1,
      type: 'bot',
      content: '您好！我是智旅AI助手 🤖\n\n我可以帮助您：\n• 规划个性化旅行路线\n• 推荐热门景点和美食\n• 制定详细行程安排\n• 解答旅行相关问题\n\n请告诉我您想去哪里旅行，或者有什么旅行计划需要帮助？',
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages([welcomeMessage])
    localStorage.removeItem(STORAGE_KEY)
  }

  // 智能调用Coze工作流API - 根据环境选择调用方式
  const callCozeWorkflow = async (userInput) => {
    try {
      let url, headers
      
      if (config.useServerless) {
        // 生产环境：使用serverless函数
        url = '/api/coze/workflow/run'
        headers = {
          'Content-Type': 'application/json'
        }
      } else {
        // 本地开发：使用Vite代理路径避免CORS问题
        url = '/api/coze/workflow/run'
        headers = {
          'Content-Type': 'application/json'
          // Authorization头由Vite代理自动添加，不需要手动设置
        }
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          workflow_id,
          parameters: {
            input: userInput
          }
        })
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // 打印完整的API响应用于调试
      console.log('🔍 Coze API完整响应:', JSON.stringify(data, null, 2))
      
      // 根据Coze API返回格式提取输出 - 支持多种可能的格式
      let result = null
      
      // 首先处理data.data是字符串的情况（需要解析JSON）
      if (data.data && typeof data.data === 'string') {
        try {
          const parsedData = JSON.parse(data.data)
          console.log('🔄 解析data.data字符串:', parsedData)
          if (parsedData.output) {
            result = parsedData.output
          } else if (parsedData.result) {
            result = parsedData.result
          } else if (parsedData.response) {
            result = parsedData.response
          } else if (parsedData.content) {
            result = parsedData.content
          }
        } catch (e) {
          console.warn('⚠️ data.data不是有效的JSON，直接使用:', data.data)
          result = data.data
        }
      }
      // 然后尝试其他常见的路径
      else if (data.data && data.data.output) {
        result = data.data.output
      } else if (data.output) {
        result = data.output
      } else if (data.data && data.data.result) {
        result = data.data.result
      } else if (data.result) {
        result = data.result
      } else if (data.data && data.data.response) {
        result = data.data.response
      } else if (data.response) {
        result = data.response
      } else if (data.data && data.data.content) {
        result = data.data.content
      } else if (data.content) {
        result = data.content
      } else if (data.message) {
        result = data.message
      }
      
      if (result) {
        console.log('✅ 成功提取AI回复:', result)
        return result
      } else {
        console.error('❌ 未找到输出字段，可用字段:', Object.keys(data))
        if (data.data) {
          console.error('data字段内容:', Object.keys(data.data))
        }
        throw new Error(`API返回格式异常，未找到output字段。可用字段: ${Object.keys(data).join(', ')}`)
      }
    } catch (error) {
      console.error('Coze工作流API调用失败:', error)
      throw error
    }
  }

  // 初始化聊天记录 - 优先从localStorage加载
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage()
    if (savedMessages) {
      setMessages(savedMessages)
    } else {
      // 如果没有保存的记录，显示默认欢迎消息
      const welcomeMessage = {
        id: 1,
        type: 'bot',
        content: '您好！我是智旅AI助手 🤖\n\n我可以帮助您：\n• 规划个性化旅行路线\n• 推荐热门景点和美食\n• 制定详细行程安排\n• 解答旅行相关问题\n\n请告诉我您想去哪里旅行，或者有什么旅行计划需要帮助？',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages([welcomeMessage])
    }
  }, [])
  
  // 监听messages变化，自动保存到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages)
    }
  }, [messages])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 用户信息现在通过Zustand store自动更新，无需手动监听

  // 发送消息
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return

    const userMessage = inputValue.trim()
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)

    // 先添加一个加载中的消息
    const loadingMessageId = Date.now() + 1
    const loadingMessage = {
      id: loadingMessageId,
      type: 'bot',
      content: 'AI正在思考中...',
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // 调用Coze工作流API
      const aiResponse = await callCozeWorkflow(userMessage)
      
      // 替换加载消息为实际回复
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessageId 
            ? {
                ...msg,
                content: aiResponse,
                isLoading: false
              }
            : msg
        )
      )
    } catch (error) {
      console.error('AI回复失败:', error)
      
      // 替换加载消息为错误信息
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessageId 
            ? {
                ...msg,
                content: `抱歉，AI服务暂时不可用 😅\n\n${error.message.includes('API请求失败') ? '请检查网络连接或稍后重试' : ''}`,
                isLoading: false
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 处理输入框回车事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={styles.chatContainer}>
      {/* 顶部导航栏 */}
      <div className={styles.chatHeader}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          &lt;
        </button>
        <div className={styles.headerInfo}>
          <h2 className={styles.chatTitle}>AI智能助手</h2>
          <span className={styles.onlineStatus}>● 在线</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.clearButton}
            onClick={clearChatHistory}
            title="清空聊天记录"
          >
            🗑️
          </button>
          <div className={styles.robotAvatar}>🤖</div>
        </div>
      </div>

      {/* 聊天消息区域 */}
      <div className={styles.messagesContainer}>
        <div className={styles.messagesList}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageItem} ${
                message.type === 'user' ? styles.userMessage : styles.botMessage
              }`}
            >
              <div className={styles.messageAvatar}>
                {message.type === 'user' ? (
                  <UserAvatar 
                    size={40}
                    round={true}
                    className={styles.avatarImage}
                  />
                ) : (
                  '🤖'
                )}
              </div>
              <div className={styles.messageContent}>
                <div className={`${styles.messageBubble} ${message.isLoading ? styles.loadingMessage : ''}`}>
                  <div className={styles.messageText}>
                    {message.isLoading ? (
                      <>
                        {message.content}
                        <div className={styles.loadingDots}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </>
                    ) : (
                      <div className={styles.formattedContent}>
                        {formatMessageContent(message.content)}
                      </div>
                    )}
                  </div>
                  <div className={styles.messageTime}>{message.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部输入区域 */}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入您的旅行问题..."
            className={styles.messageInput}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isLoading}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Coze