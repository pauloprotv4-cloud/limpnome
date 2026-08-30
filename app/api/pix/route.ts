import { NextResponse } from 'next/server'
import { lerConsulta } from '@/lib/consulta-server'
import { normalizarCpf } from '@/lib/consulta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Configuração da adquirente Paradise (server-to-server apenas).
const PARADISE_BASE = 'https://multi.paradisepags.com'

// Valores permitidos (server-side allowlist para impedir valores arbitrários do client).
// acordo: R$ 10,92 -> 1092 centavos | tpe: R$ 78,25 -> 7825 centavos.
const VALORES: Record<string, { cents: number; description: string; prefix: string }> = {
  acordo: { cents: 1092, description: 'Acordo de quitação de dívidas', prefix: 'ACORDO' },
  tpe: { cents: 7825, description: 'Taxa de Processamento Eletrônico (TPE)', prefix: 'TPE' },
}

export async function POST(request: Request) {
  const secret = process.env.SECRETKEY

  if (!secret) {
    return NextResponse.json({ error: 'Pagamento indisponível no momento.' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const tipo = body?.tipo === 'tpe' ? 'tpe' : 'acordo'
  const { cents, description, prefix } = VALORES[tipo]

  // Dados do lead vêm do cookie da consulta (não confiamos no client).
  const dados = await lerConsulta()
  const cpfDigits = normalizarCpf(dados.cpf)

  const reference = `${prefix}-${cpfDigits || 'SEMCPF'}-${Date.now()}`

  const payload = {
    amount: cents,
    description,
    reference,
    source: 'api_externa',
    customer: {
      name: dados.nome,
      email: `${cpfDigits || 'cliente'}@clientes.acordo.com`,
      phone: '11999999999',
      document: cpfDigits || '00000000000',
    },
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await fetch(`${PARADISE_BASE}/api/v1/transaction.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': secret,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal,
    })

    const text = await response.text()
    let json: Record<string, unknown> | null = null
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }

    if (!response.ok || !json || json.status !== 'success') {
      console.log('[v0] Paradise transaction error:', response.status, text.slice(0, 300))
      return NextResponse.json({ error: 'Não foi possível gerar o PIX agora.' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      transactionId: json.transaction_id,
      reference: json.id ?? reference,
      qrCode: json.qr_code,
      qrCodeBase64: json.qr_code_base64,
      amount: json.amount ?? cents,
      expiresAt: json.expires_at ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Não foi possível gerar o PIX agora.' }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
