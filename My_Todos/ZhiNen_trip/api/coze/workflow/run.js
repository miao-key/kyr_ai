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

    // 允许通过环境变量切换 Coze API 域名；未指定时并发尝试 .cn 与 .com，优先返回最快可用结果
    const explicitBase = process.env.COZE_API_BASE
    const timeoutMs = Number(process.env.COZE_API_TIMEOUT_MS || 25000)

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
          // 标记失败，便于 Promise.any 聚合
          return Promise.reject({ ok: false, error: err && (err.message || String(err)) })
        })
        .finally(() => clearTimeout(t))
    }

    let result
    if (explicitBase) {
      // 明确指定域名时只请求该域名
      try {
        result = await runOnce(explicitBase)
      } catch (e) {
        const msg = e && e.error ? e.error : (e.message || 'Unknown error')
        const status = /abort|timeout/i.test(msg) ? 504 : 502
        return new Response(
          JSON.stringify({ error: `Request failed for ${explicitBase}`, detail: msg, timeoutMs }),
          { status, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // 并发 .cn 与 .com，谁先返回就用谁
      const candidates = ['https://api.coze.cn', 'https://api.coze.com']
      try {
        result = await Promise.any(candidates.map(runOnce))
      } catch (aggregate) {
        // 所有候选都失败
        return new Response(
          JSON.stringify({ error: 'All upstream endpoints failed or timed out', timeoutMs }),
          { status: 504, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(result.text, {
      status: result.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

