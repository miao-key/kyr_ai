export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const url = new URL(req.url)
    const pathSuffix = url.pathname.replace(/^\/api\/pexels\//, '')
    const target = `https://api.pexels.com/v1/${pathSuffix}${url.search}`

    const apiKey = process.env.PEXELS_API_KEY || process.env.VITE_PEXELS_API
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing PEXELS_API_KEY' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const resp = await fetch(target, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json'
      }
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

