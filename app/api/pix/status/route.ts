import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PARADISE_BASE = 'https://multi.paradisepags.com'

export async function GET(request: Request) {
  const secret = process.env.SECRETKEY
  if (!secret) {
    return NextResponse.json({ error: 'Consulta indisponível.' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(
      `${PARADISE_BASE}/api/v1/query.php?action=get_transaction&id=${encodeURIComponent(id)}`,
      {
        headers: {
          'X-API-Key': secret,
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      },
    )

    const text = await response.text()
    let json: Record<string, unknown> | null = null
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }

    if (!response.ok || !json) {
      return NextResponse.json({ error: 'Não foi possível consultar o status.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, status: String(json.status ?? 'pending') })
  } catch {
    return NextResponse.json({ error: 'Não foi possível consultar o status.' }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
