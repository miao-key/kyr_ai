export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const token = process.env.DOUBAO_IMAGE_API_KEY || process.env.VITE_DOUBAO_IMAGE_API_KEY
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing DOUBAO_IMAGE_API_KEY' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.text()
    const resp = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body
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

