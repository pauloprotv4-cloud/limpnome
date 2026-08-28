'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

// Dados genéricos exibidos ao lead (não temos API de CPF).
const NOME_CLIENTE = 'CLIENTE'
const CPF_CLIENTE = '000.000.000-00'

function formatTime(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) segundos = 0
  const min = Math.floor(segundos / 60)
  const seg = Math.floor(segundos % 60)
  return `${min}:${seg.toString().padStart(2, '0')}`
}

export default function AcordoClient() {
  const [encontrado, setEncontrado] = useState(false)
  const [mostrarPlayer, setMostrarPlayer] = useState(false)
  const [tocando, setTocando] = useState(false)
  const [tempoAtual, setTempoAtual] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Simula a verificação de acordos antes de revelar o resultado.
  useEffect(() => {
    const t = window.setTimeout(() => setEncontrado(true), 3000)
    return () => window.clearTimeout(t)
  }, [])

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
    <section aria-label="Verificação de acordo" className="w-full max-w-[640px] space-y-4">
      <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-5">
        <p className="text-sm italic leading-relaxed text-gray-700 sm:text-base">
          Por favor, aguarde enquanto nosso sistema verifica se existem acordos disponíveis para você...
        </p>
      </div>

      {encontrado && (
        <>
          <div className="w-fit max-w-full rounded-full border border-gray-100 bg-white px-4 py-2.5 shadow-sm sm:px-6 sm:py-3.5">
            <p className="text-sm font-bold text-gray-900 sm:text-base">Acordo encontrado!</p>
          </div>

          <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              <span className="font-bold text-gray-900">1 (um)</span> acordo foi encontrado para:
            </p>
            <p className="mt-3 text-base font-bold text-[#1e40af] sm:text-lg">{NOME_CLIENTE}</p>
            <p className="mt-1 text-base font-bold text-[#1e40af] sm:text-lg">CPF: {CPF_CLIENTE}</p>
          </div>

          {!mostrarPlayer ? (
            <button
              type="button"
              onClick={() => setMostrarPlayer(true)}
              className="block w-full rounded-full bg-[#1e40af] px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#1a3696] sm:px-6 sm:py-3.5 sm:text-base"
            >
              VER ACORDO
            </button>
          ) : (
            <section
              aria-label="Áudio do acordo"
              className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6"
            >
              <audio
                ref={audioRef}
                src="/assets/buscaacordo.mp3"
                preload="auto"
                onPlay={() => setTocando(true)}
                onPause={() => setTocando(false)}
                onLoadedMetadata={(e) => setDuracao(e.currentTarget.duration)}
                onTimeUpdate={(e) => setTempoAtual(e.currentTarget.currentTime)}
                onEnded={() => setTocando(false)}
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
                    <div
                      className="h-full rounded-full bg-[#1e40af] transition-[width]"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 sm:text-sm">
                    <span>{formatTime(tempoAtual)}</span>
                    <span>{formatTime(duracao)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-sm text-gray-400">Ouça o áudio completo para continuar</p>
            </section>
          )}
        </>
      )}
    </section>
  )
}
