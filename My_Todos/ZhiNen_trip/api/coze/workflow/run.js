export const config = { 
  runtime: 'nodejs18.x',
  maxDuration: 60
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
    const body = req.body

    const token = process.env.COZE_PAT_TOKEN || process.env.VITE_PAT_TOKEN
    if (!token) {
      res.status(500).json({ error: 'Missing COZE_PAT_TOKEN' })
      return
    }

    console.log('🚀 Coze工作流开始执行...')
    const startTime = Date.now()

    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const result = await response.text()
    const duration = Date.now() - startTime
    
    console.log(`✅ Coze工作流执行完成，耗时: ${duration}ms`)

    res.status(response.status).json(JSON.parse(result))
  } catch (err) {
    console.error('❌ Coze工作流执行失败:', err)
    res.status(500).json({ error: err.message || 'Internal Error' })
  }
}

