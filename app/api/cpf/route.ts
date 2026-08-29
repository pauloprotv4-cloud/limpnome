import { NextResponse } from 'next/server'
import {
  COOKIE_CONSULTA,
  formatarCpfCompleto,
  interpretarNascimento,
  normalizarCpf,
  validarCpf,
} from '@/lib/consulta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const now = Date.now()
  const current = attempts.get(ip)

  if (current && current.resetAt > now && current.count >= MAX_REQUESTS) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um minuto.' }, { status: 429 })
  }

  attempts.set(
    ip,
    current && current.resetAt > now
      ? { count: current.count + 1, resetAt: current.resetAt }
      : { count: 1, resetAt: now + WINDOW_MS },
  )

  const body = await request.json().catch(() => null)
  const cpf = normalizarCpf(body?.cpf)

  if (!validarCpf(cpf)) {
    return NextResponse.json({ error: 'Informe um CPF válido.' }, { status: 400 })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8_000)

  try {
    const response = await fetch(
      `https://base2.sistemafullativo.online:80/api/cad?CPF=${encodeURIComponent(cpf)}`,
      {
        headers: {
          Accept: 'application/json,text/plain,*/*',
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://base2.sistemafullativo.online/',
        },
        cache: 'no-store',
        signal: controller.signal,
      },
    )

    const text = await response.text()

    if (!response.ok || !text.trim()) {
      return NextResponse.json({ error: 'Não foi possível concluir a consulta agora.' }, { status: 502 })
    }

    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Não foi possível concluir a consulta agora.' }, { status: 502 })
    }

    const nome = String(payload['nome'] ?? '').trim()
    const dataNascimento = String(payload['dataNascimento'] ?? '').trim()

    if (!nome || !dataNascimento) {
      return NextResponse.json({ error: 'Não foi possível concluir a consulta agora.' }, { status: 502 })
    }

    const { display: nascimento, idade } = interpretarNascimento(dataNascimento)

    const dados = {
      nome: nome.toUpperCase(),
      cpf: formatarCpfCompleto(cpf),
      nascimento,
      idade,
    }

    const res = NextResponse.json({ ok: true, data: dados })
    res.cookies.set(COOKIE_CONSULTA, encodeURIComponent(JSON.stringify(dados)), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Não foi possível concluir a consulta agora.' }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
