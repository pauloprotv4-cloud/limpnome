import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const API_BASE = 'http://base2.sistemafullativo.online:80/api/cad'

// Procura recursivamente por um valor de nome na resposta da API
function extrairNome(dados: unknown): string | null {
  if (!dados || typeof dados !== 'object') return null

  const obj = dados as Record<string, unknown>
  const chavesNome = ['nome', 'name', 'nome_completo', 'nomecompleto', 'cliente', 'titular']

  for (const [chave, valor] of Object.entries(obj)) {
    if (typeof valor === 'string' && valor.trim() && chavesNome.includes(chave.toLowerCase())) {
      return valor.trim()
    }
  }

  for (const valor of Object.values(obj)) {
    if (valor && typeof valor === 'object') {
      const aninhado = extrairNome(valor)
      if (aninhado) return aninhado
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  const cpf = (request.nextUrl.searchParams.get('cpf') || '').replace(/\D/g, '')

  if (cpf.length !== 11) {
    return NextResponse.json({ ok: false, erro: 'CPF inválido' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  const url = `${API_BASE}?CPF=${cpf}`

  try {
    const resposta = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    })

    const texto = await resposta.text()
    let dados: unknown = texto
    try {
      dados = JSON.parse(texto)
    } catch {
      // resposta não é JSON — mantém texto bruto
    }

    const nome = extrairNome(dados) || (typeof dados === 'string' && dados.trim() ? dados.trim() : null)

    // debug: expõe status e amostra da resposta para diagnóstico em produção
    return NextResponse.json({
      ok: true,
      nome,
      dados,
      debug: {
        status: resposta.status,
        statusText: resposta.statusText,
        amostra: texto.slice(0, 500),
      },
    })
  } catch (erro) {
    const nome = erro instanceof Error ? erro.name : 'Erro'
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    const causa =
      erro instanceof Error && 'cause' in erro && erro.cause ? String((erro.cause as { message?: string })?.message ?? erro.cause) : null

    return NextResponse.json(
      {
        ok: false,
        erro: nome === 'AbortError' ? 'Tempo de consulta excedido (30s)' : `${nome}: ${mensagem}`,
        debug: { nome, mensagem, causa, url },
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
