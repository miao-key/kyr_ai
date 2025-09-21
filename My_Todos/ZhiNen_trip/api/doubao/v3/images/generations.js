export const config = { 
  runtime: 'nodejs',
  maxDuration: 30
}

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const token = process.env.DOUBAO_IMAGE_API_KEY || process.env.VITE_DOUBAO_IMAGE_API_KEY
    if (!token) {
      res.status(500).json({ error: 'Missing DOUBAO_IMAGE_API_KEY' })
      return
    }

    console.log('🎨 豆包图片生成开始...')
    const startTime = Date.now()

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(req.body)
    })

    const result = await response.text()
    const duration = Date.now() - startTime
    
    console.log(`豆包API响应状态: ${response.status}`)
    console.log(`豆包图片生成耗时: ${duration}ms`)

    // 如果不是200状态，记录错误信息
    if (!response.ok) {
      console.error(`豆包API错误 ${response.status}:`, result)
      return res.status(response.status).json({
        error: `Doubao API Error: ${response.status}`,
        message: result
      })
    }

    // 尝试解析JSON
    try {
      const parsedResult = JSON.parse(result)
      res.status(response.status).json(parsedResult)
    } catch (parseError) {
      console.error('JSON解析失败:', parseError.message)
      console.error('原始响应:', result)
      res.status(500).json({
        error: 'Invalid JSON response',
        raw_response: result
      })
    }
  } catch (err) {
    console.error('❌ 豆包图片生成失败:', err)
    res.status(500).json({ error: err.message || 'Internal Error' })
  }
}

