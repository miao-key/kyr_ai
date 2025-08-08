export const config = { runtime: 'edge' }

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

    const resp = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

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

