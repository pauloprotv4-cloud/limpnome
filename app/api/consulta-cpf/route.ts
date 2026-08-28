import { type NextRequest, NextResponse } from 'next/server'
import http from 'node:http'
import net from 'node:net'
import { SocksProxyAgent } from 'socks-proxy-agent'

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

// Normaliza o PROXY_URL em partes utilizáveis.
// Aceita formatos: http://user:pass@host:port  |  host:port:user:pass  |  host:port
type ProxyInfo = { host: string; port: number; auth?: string; socks: boolean; url: string }

function lerProxy(): ProxyInfo | null {
  const raw = (process.env.PROXY_URL || '').trim()
  if (!raw) return null

  const ehSocks = /^socks/i.test(raw)

  // formato URL padrão
  try {
    const u = new URL(raw.includes('://') ? raw : `http://${raw}`)
    if (u.hostname && u.port) {
      const socks = /^socks/i.test(u.protocol)
      const user = u.username ? decodeURIComponent(u.username) : ''
      const pass = u.password ? decodeURIComponent(u.password) : ''
      const auth = user ? `${user}:${pass}` : undefined
      const proto = socks ? (u.protocol.replace(':', '') || 'socks5') : 'http'
      const credencial = auth ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : ''
      const url = `${proto}://${credencial}${u.hostname}:${u.port}`
      return { host: u.hostname, port: Number(u.port), auth, socks, url }
    }
  } catch {
    // tenta formato host:port:user:pass
  }

  const partes = raw.split(':')
  if (partes.length === 4) {
    const [host, port, user, pass] = partes
    const proto = ehSocks ? 'socks5' : 'http'
    return {
      host,
      port: Number(port),
      auth: `${user}:${pass}`,
      socks: ehSocks,
      url: `${proto}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`,
    }
  }
  if (partes.length === 2) {
    const [host, port] = partes
    const proto = ehSocks ? 'socks5' : 'http'
    return { host, port: Number(port), socks: ehSocks, url: `${proto}://${host}:${port}` }
  }

  return null
}

// Consulta a API através de um proxy SOCKS5 usando http nativo + SocksProxyAgent
function consultarViaSocks(cpf: string, proxy: ProxyInfo): Promise<{ status: number; corpo: string }> {
  return new Promise((resolve, reject) => {
    const agent = new SocksProxyAgent(proxy.url, { timeout: 20000 })
    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path: `${API_PATH}?CPF=${cpf}`,
        method: 'GET',
        timeout: 30000,
        agent,
        headers: {
          Host: API_HOST,
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
        res.on('end', () => resolve({ status: res.statusCode ?? 0, corpo }))
      },
    )
    req.on('timeout', () => req.destroy(new Error('Tempo de consulta excedido (30s)')))
    req.on('error', (err) => reject(err))
    req.end()
  })
}

// Monta a requisição HTTP crua para enviar dentro do túnel
// Abre um túnel CONNECT no proxy e resolve com o socket já tunelado
function abrirTunel(proxy: ProxyInfo): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = net.connect(proxy.port, proxy.host)
    let bufferConnect = ''

    const timer = setTimeout(() => {
      socket.destroy()
      reject(new Error('Tempo de conexão com o proxy excedido (20s)'))
    }, 20000)

    const onData = (chunk: Buffer) => {
      bufferConnect += chunk.toString('binary')
      if (bufferConnect.includes('\r\n\r\n')) {
        clearTimeout(timer)
        socket.removeListener('data', onData)
        const linha = bufferConnect.split('\r\n')[0] || ''
        if (!/ 200/.test(linha)) {
          socket.destroy()
          const cabecalhos = bufferConnect.split('\r\n\r\n')[0].replace(/\r\n/g, ' | ')
          reject(new Error(`Proxy recusou o túnel: ${cabecalhos}`))
          return
        }
        resolve(socket)
      }
    }

    socket.on('connect', () => {
      let connectReq = `CONNECT ${API_HOST}:${API_PORT} HTTP/1.1\r\nHost: ${API_HOST}:${API_PORT}\r\n`
      if (proxy.auth) {
        connectReq += `Proxy-Authorization: Basic ${Buffer.from(proxy.auth).toString('base64')}\r\n`
      }
      connectReq += `\r\n`
      socket.write(connectReq)
    })

    socket.on('data', onData)
    socket.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

// Consulta a API através de um túnel CONNECT no proxy residencial.
// Depois de abrir o túnel, entrega o socket ao http.request para que o
// próprio Node faça o parsing correto da resposta (status, chunked, etc.).
async function consultarViaProxy(cpf: string, proxy: ProxyInfo): Promise<{ status: number; corpo: string }> {
  const tunel = await abrirTunel(proxy)
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path: `${API_PATH}?CPF=${cpf}`,
        method: 'GET',
        timeout: 30000,
        createConnection: () => tunel,
        headers: {
          Host: API_HOST,
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
        res.on('end', () => resolve({ status: res.statusCode ?? 0, corpo }))
      },
    )
    req.on('timeout', () => req.destroy(new Error('Tempo de consulta excedido (30s)')))
    req.on('error', (err) => reject(err))
    req.end()
  })
}

// Consulta direta (sem proxy) usando http nativo
function consultarDireto(cpf: string): Promise<{ status: number; corpo: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path: `${API_PATH}?CPF=${cpf}`,
        method: 'GET',
        timeout: 25000,
        agent: new http.Agent({ keepAlive: false }),
        headers: {
          Host: API_HOST,
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
        res.on('end', () => resolve({ status: res.statusCode ?? 0, corpo }))
      },
    )
    req.on('timeout', () => req.destroy(new Error('Tempo de consulta excedido (25s)')))
    req.on('error', (err) => reject(err))
    req.end()
  })
}

async function consultarApi(cpf: string): Promise<{ status: number; corpo: string; via: string }> {
  const proxy = lerProxy()

  if (proxy) {
    // monta as duas variantes do mesmo endpoint (SOCKS5 e HTTP CONNECT)
    const credencial = proxy.auth ? `${proxy.auth.split(':').map(encodeURIComponent).join(':')}@` : ''
    // socks5h força a resolução de DNS no lado do proxy (evita "socket hang up")
    const socksProxy: ProxyInfo = { ...proxy, socks: true, url: `socks5h://${credencial}${proxy.host}:${proxy.port}` }
    const httpProxy: ProxyInfo = { ...proxy, socks: false }

    // tenta primeiro o protocolo declarado; se falhar, tenta o outro
    const ordem: Array<{ tipo: 'socks' | 'http'; info: ProxyInfo }> = proxy.socks
      ? [{ tipo: 'socks', info: socksProxy }, { tipo: 'http', info: httpProxy }]
      : [{ tipo: 'http', info: httpProxy }, { tipo: 'socks', info: socksProxy }]

    const erros: string[] = []
    for (const alvo of ordem) {
      try {
        const resultado =
          alvo.tipo === 'socks' ? await consultarViaSocks(cpf, alvo.info) : await consultarViaProxy(cpf, alvo.info)
        // só aceita se veio conteúdo; caso contrário tenta o próximo protocolo
        if (resultado.corpo && resultado.corpo.trim()) {
          return { ...resultado, via: `${alvo.tipo}(${proxy.host})` }
        }
        erros.push(`${alvo.tipo}: resposta vazia (status ${resultado.status})`)
      } catch (err) {
        erros.push(`${alvo.tipo}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    throw new Error(`Proxy falhou → ${erros.join(' | ')}`)
  }

  const { status, corpo } = await consultarDireto(cpf)
  return { status, corpo, via: 'direto' }
}

export async function GET(request: NextRequest) {
  const cpf = (request.nextUrl.searchParams.get('cpf') || '').replace(/\D/g, '')

  if (cpf.length !== 11) {
    return NextResponse.json({ ok: false, erro: 'CPF inválido' }, { status: 400 })
  }

  try {
    const { status, corpo, via } = await consultarApi(cpf)

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
      debug: { status, via, amostra: corpo.slice(0, 500) },
    })
  } catch (erro) {
    const nome = erro instanceof Error ? erro.name : 'Erro'
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    const p = lerProxy()

    return NextResponse.json(
      {
        ok: false,
        erro: `${nome}: ${mensagem}`,
        debug: {
          nome,
          mensagem,
          proxyDefinido: !!process.env.PROXY_URL,
          proxyParse: p
            ? { host: p.host, port: p.port, temAuth: !!p.auth, authLen: p.auth?.length ?? 0, socks: p.socks }
            : null,
        },
      },
      { status: 502 },
    )
  }
}
