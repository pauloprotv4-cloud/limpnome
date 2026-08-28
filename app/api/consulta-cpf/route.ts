import { type NextRequest, NextResponse } from 'next/server'
import http from 'node:http'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const API_HOST = 'base2.sistemafullativo.online'
const API_PORT = 80
const API_PATH = '/api/cad'

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

// Faz a requisição usando o módulo http nativo do Node.
// O fetch do Node (undici) falha com "other side closed" neste servidor legado,
// por isso usamos http.request com Connection: close.
function consultarApi(cpf: string): Promise<{ status: number; corpo: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path: `${API_PATH}?CPF=${cpf}`,
        method: 'GET',
        timeout: 30000,
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          Connection: 'close',
        },
      },
      (res) => {
        let corpo = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          corpo += chunk
        })
        res.on('end', () => {
          resolve({ status: res.statusCode ?? 0, corpo })
        })
      },
    )

    req.on('timeout', () => {
      req.destroy(new Error('Tempo de consulta excedido (30s)'))
    })
    req.on('error', (err) => reject(err))
    req.end()
  })
}

export async function GET(request: NextRequest) {
  const cpf = (request.nextUrl.searchParams.get('cpf') || '').replace(/\D/g, '')

  if (cpf.length !== 11) {
    return NextResponse.json({ ok: false, erro: 'CPF inválido' }, { status: 400 })
  }

  try {
    const { status, corpo } = await consultarApi(cpf)

    let dados: unknown = corpo
    try {
      dados = JSON.parse(corpo)
    } catch {
      // resposta não é JSON — mantém texto bruto
    }

    const nome = extrairNome(dados) || (typeof dados === 'string' && dados.trim() ? dados.trim() : null)

    return NextResponse.json({
      ok: true,
      nome,
      dados,
      debug: { status, amostra: corpo.slice(0, 500) },
    })
  } catch (erro) {
    const nome = erro instanceof Error ? erro.name : 'Erro'
    const mensagem = erro instanceof Error ? erro.message : String(erro)

    return NextResponse.json(
      {
        ok: false,
        erro: `${nome}: ${mensagem}`,
        debug: { nome, mensagem },
      },
      { status: 502 },
    )
  }
}
