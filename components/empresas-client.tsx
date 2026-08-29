'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pause, Play } from 'lucide-react'

function formatTime(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) segundos = 0
  const min = Math.floor(segundos / 60)
  const seg = Math.floor(segundos % 60)
  return `${min}:${seg.toString().padStart(2, '0')}`
}

export default function EmpresasClient({ nome = 'CLIENTE' }: { nome?: string }) {
  const router = useRouter()
  const [mostrarPlayer, setMostrarPlayer] = useState(false)
  const [tocando, setTocando] = useState(false)
  const [tempoAtual, setTempoAtual] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [audioTerminou, setAudioTerminou] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const alternarPlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const progresso = duracao > 0 ? (tempoAtual / duracao) * 100 : 0

  return (
    <article className="w-full max-w-[640px] space-y-6 rounded-lg bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8 md:px-10 md:py-10">
      <div className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-900 shadow-[0_1px_6px_rgba(0,0,0,0.15)] sm:text-base">
        Login efetuado com sucesso!
      </div>

      <section
        aria-label="Boas-vindas"
        className="w-full rounded-xl border border-gray-200 px-4 py-4 shadow-sm sm:px-6 sm:py-5"
      >
        <h1 className="text-base font-bold text-gray-900 sm:text-lg">{nome}</h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">Seja bem vindo(a) a sua conta Gov.br</p>
      </section>

      <section
        aria-label="Empresas para negociação"
        className="w-full rounded-xl border border-gray-200 px-4 py-5 shadow-sm sm:px-6 sm:py-6"
      >
        <p className="text-sm text-gray-700 sm:text-base">Negocie dívidas com as seguintes empresas:</p>
        <img
          src="/assets/empresas-parceiras.png"
          alt="Empresas parceiras do Desenrola Brasil para negociação de dívidas"
          className="mx-auto mt-4 block h-auto w-full max-w-md object-contain"
        />
      </section>

      {!mostrarPlayer ? (
        <button
          type="button"
          onClick={() => setMostrarPlayer(true)}
          className="w-full rounded-full bg-[#1e40af] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-lg"
        >
          Continuar
        </button>
      ) : (
        <section
          aria-label="Áudio de continuação"
          className="w-full rounded-xl border border-gray-200 px-4 py-5 shadow-sm sm:px-6 sm:py-6"
        >
          <audio
            ref={audioRef}
            src="/assets/parabens.mp3"
            preload="auto"
            onPlay={() => setTocando(true)}
            onPause={() => setTocando(false)}
            onLoadedMetadata={(e) => setDuracao(e.currentTarget.duration)}
            onTimeUpdate={(e) => setTempoAtual(e.currentTarget.currentTime)}
            onEnded={() => {
              setTocando(false)
              setAudioTerminou(true)
            }}
          />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={alternarPlay}
              aria-label={tocando ? 'Pausar áudio' : 'Reproduzir áudio'}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-white transition-colors hover:bg-[#1a3696]"
            >
              {tocando ? (
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
              )}
            </button>

            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[#1e40af] transition-[width]" style={{ width: `${progresso}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 sm:text-sm">
                <span>{formatTime(tempoAtual)}</span>
                <span>{formatTime(duracao)}</span>
              </div>
            </div>
          </div>

          {audioTerminou ? (
            <button
              type="button"
              onClick={() => router.push('/analise')}
              className="mt-5 w-full rounded-full bg-[#1e40af] py-3.5 text-base font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-lg"
            >
              Sim! Quero continuar
            </button>
          ) : (
            <p className="mt-4 text-center text-sm text-gray-400">Ouça o áudio completo para continuar</p>
          )}
        </section>
      )}
    </article>
  )
}
