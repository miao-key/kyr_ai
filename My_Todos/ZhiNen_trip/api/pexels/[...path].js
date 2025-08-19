export const config = { 
  runtime: 'nodejs18.x',
  maxDuration: 10
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

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const { query } = req
    const pathSuffix = req.url.replace(/^\/api\/pexels\//, '').split('?')[0]
    const searchParams = new URLSearchParams(query).toString()
    const target = `https://api.pexels.com/v1/${pathSuffix}${searchParams ? '?' + searchParams : ''}`

    const apiKey = process.env.PEXELS_API_KEY || process.env.VITE_PEXELS_API
    if (!apiKey) {
      res.status(500).json({ error: 'Missing PEXELS_API_KEY' })
      return
    }

    console.log('📸 Pexels API请求开始...')
    const startTime = Date.now()

    const response = await fetch(target, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.text()
    const duration = Date.now() - startTime
    
    console.log(`✅ Pexels API请求完成，耗时: ${duration}ms`)

    res.status(response.status).json(JSON.parse(result))
  } catch (err) {
    console.error('❌ Pexels API请求失败:', err)
    res.status(500).json({ error: err.message || 'Internal Error' })
  }
}

