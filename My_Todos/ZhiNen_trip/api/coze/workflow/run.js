export const config = {
  runtime: 'nodejs',
  // 移除多区域设置以避免免费计划限制
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'text/plain')
    res.end('Method Not Allowed')
    return
  }

  const readJsonBody = async () => {
    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString('utf-8')
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  }

  try {
    const body = await readJsonBody()

    const token = process.env.COZE_PAT_TOKEN || process.env.VITE_PAT_TOKEN
    if (!token) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Missing COZE_PAT_TOKEN' }))
      return
    }

    // 允许通过环境变量切换 Coze API 域名；未指定时并发尝试 .cn 与 .com，优先返回最快可用结果
    const explicitBase = process.env.COZE_API_BASE
    const timeoutMs = Number(process.env.COZE_API_TIMEOUT_MS || 55000)

    const runOnce = (base) => {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), timeoutMs)
      return fetch(`${base}/v1/workflow/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: 'no-store',
      })
        .then(async (resp) => {
          const text = await resp.text()
          return { ok: true, status: resp.status, text }
        })
        .catch((err) => {
          return Promise.reject({ ok: false, error: err && (err.message || String(err)) })
        })
        .finally(() => clearTimeout(t))
    }

    let result
    if (explicitBase) {
      try {
        result = await runOnce(explicitBase)
      } catch (e) {
        const msg = e && e.error ? e.error : (e.message || 'Unknown error')
        const status = /abort|timeout/i.test(msg) ? 504 : 502
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Request failed for ${explicitBase}`, detail: msg, timeoutMs }))
        return
      }
    } else {
      const candidates = ['https://api.coze.cn', 'https://api.coze.com']
      try {
        result = await Promise.any(candidates.map(runOnce))
      } catch (aggregate) {
        res.statusCode = 504
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'All upstream endpoints failed or timed out', timeoutMs }))
        return
      }
    }

    res.statusCode = result.status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(result.text)
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: err.message || 'Internal Error' }))
  }
}

