export const config = { 
  runtime: 'nodejs18.x',
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
    
    console.log(`✅ 豆包图片生成完成，耗时: ${duration}ms`)

    res.status(response.status).json(JSON.parse(result))
  } catch (err) {
    console.error('❌ 豆包图片生成失败:', err)
    res.status(500).json({ error: err.message || 'Internal Error' })
  }
}

