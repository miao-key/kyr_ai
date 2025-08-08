export const config = {
  runtime: 'edge',
  // 就近亚洲区域，降低到 Coze 的网络延迟
  regions: ['sin1', 'hkg1', 'icn1'],
  // 增加执行上限，避免网关过早 504（具体可根据账号配额调整）
  maxDuration: 30,
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const body = await req.json()

    const token = process.env.COZE_PAT_TOKEN || process.env.VITE_PAT_TOKEN
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing COZE_PAT_TOKEN' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 允许通过环境变量切换 Coze API 域名（例如可能存在全球加速域名）
    const COZE_API_BASE = process.env.COZE_API_BASE || 'https://api.coze.cn'

    // 超时控制，避免网关默认 504，便于在客户端展示更明确的错误
    const controller = new AbortController()
    const timeoutMs = Number(process.env.COZE_API_TIMEOUT_MS || 25000)
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    let resp
    try {
      resp = await fetch(`${COZE_API_BASE}/v1/workflow/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (e) {
      if (e.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Upstream timeout when calling Coze API', timeoutMs }),
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw e
    } finally {
      clearTimeout(timeoutId)
    }

    const text = await resp.text()
    return new Response(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

