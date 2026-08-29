'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { AlertTriangle, CheckCircle2, Copy, Loader2 } from 'lucide-react'

const CODIGO_ACORDO = 'XXJIN-Jd8--'

type PixData = {
  transactionId: string
  qrCode: string
  qrCodeBase64: string
}

export default function PagamentoClient({
  nome = 'CLIENTE',
  cpf = '000.000.000-00',
}: {
  nome?: string
  cpf?: string
}) {
  const NOME_CLIENTE = nome
  const CPF_CLIENTE = cpf

  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [pix, setPix] = useState<PixData | null>(null)
  const [qrImagem, setQrImagem] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [aprovado, setAprovado] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pararPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => pararPolling, [pararPolling])

  // Usa a imagem enviada pela adquirente ou gera o QR a partir do código.
  useEffect(() => {
    if (!pix) {
      setQrImagem('')
      return
    }
    if (pix.qrCodeBase64) {
      setQrImagem(pix.qrCodeBase64)
      return
    }
    let ativo = true
    QRCode.toDataURL(pix.qrCode, { width: 320, margin: 1 })
      .then((url) => {
        if (ativo) setQrImagem(url)
      })
      .catch(() => {
        if (ativo) setQrImagem('')
      })
    return () => {
      ativo = false
    }
  }, [pix])

  async function gerarPix() {
    if (gerando) return
    setErro('')
    setGerando(true)

    try {
      const resposta = await fetch('/api/pix', { method: 'POST' })
      const json = await resposta.json().catch(() => null)

      if (!resposta.ok || !json?.ok || !json.qrCode) {
        setErro(json?.error || 'Não foi possível gerar o PIX agora.')
        return
      }

      setPix({
        transactionId: String(json.transactionId),
        qrCode: String(json.qrCode),
        qrCodeBase64: String(json.qrCodeBase64 || ''),
      })
      iniciarPolling(String(json.transactionId))
    } catch {
      setErro('Não foi possível gerar o PIX agora.')
    } finally {
      setGerando(false)
    }
  }

  function iniciarPolling(transactionId: string) {
    pararPolling()
    pollRef.current = setInterval(async () => {
      try {
        const resposta = await fetch(`/api/pix/status?id=${encodeURIComponent(transactionId)}`, {
          cache: 'no-store',
        })
        const json = await resposta.json().catch(() => null)
        if (json?.ok && json.status === 'approved') {
          setAprovado(true)
          pararPolling()
        }
      } catch {
        // silencioso: tenta novamente no próximo ciclo
      }
    }, 4000)
  }

  async function copiarCodigo() {
    if (!pix?.qrCode) return
    try {
      await navigator.clipboard.writeText(pix.qrCode)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // ignora falha de clipboard
    }
  }

  return (
    <section aria-label="Pagamento do acordo" className="w-full max-w-[640px] space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-100 px-4 py-4 sm:px-6 sm:py-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-700" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-yellow-800 sm:text-base">
          <span className="font-bold">Aviso importante:</span> O não pagamento deste acordo poderá resultar no
          cancelamento da negociação e, conforme as condições aplicáveis, em uma nova restrição ao seu CPF.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <h2 className="text-base font-bold text-[#1e40af] sm:text-lg">RESUMO DO ACORDO</h2>

        <dl className="mt-4 space-y-3 text-sm sm:text-base">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-600">Beneficiário</dt>
            <dd className="font-bold text-gray-900">{NOME_CLIENTE}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-600">CPF</dt>
            <dd className="font-bold text-gray-900">{CPF_CLIENTE}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-600">Código do acordo</dt>
            <dd className="font-bold text-gray-900">{CODIGO_ACORDO}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-600">Desconto</dt>
            <dd className="font-bold text-[#1e40af]">99% de desconto</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
            <dt className="text-gray-600">Valor a pagar</dt>
            <dd className="text-lg font-bold text-[#1e40af]">R$ 68,92</dd>
          </div>
        </dl>
      </div>

      {aprovado ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-8 text-center sm:px-6">
          <CheckCircle2 className="size-12 text-green-600" aria-hidden="true" />
          <h2 className="text-lg font-bold text-green-700 sm:text-xl">Pagamento confirmado!</h2>
          <p className="text-sm leading-relaxed text-green-800 sm:text-base">
            Seu acordo foi quitado com sucesso e seu nome será regularizado. Obrigado!
          </p>
        </div>
      ) : pix ? (
        <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
          <h2 className="text-base font-bold text-[#1e40af] sm:text-lg">PAGUE COM PIX</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
            Escaneie o QR Code abaixo ou use o PIX copia e cola para concluir o pagamento.
          </p>

          {qrImagem ? (
            <div className="mt-5 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImagem || '/placeholder.svg'}
                alt="QR Code para pagamento via PIX"
                className="h-56 w-56 rounded-xl border border-gray-100 bg-white p-2"
              />
            </div>
          ) : null}

          <div className="mt-5">
            <label className="text-sm font-medium text-gray-600">PIX copia e cola</label>
            <div className="mt-2 flex items-stretch gap-2">
              <input
                readOnly
                value={pix.qrCode}
                aria-label="Código PIX copia e cola"
                className="min-w-0 flex-1 truncate rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700"
              />
              <button
                type="button"
                onClick={copiarCodigo}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1e40af] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a3696]"
              >
                {copiado ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-[#1e40af]">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Aguardando confirmação do pagamento...
          </div>
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
          <h2 className="text-base font-bold text-[#1e40af] sm:text-lg">CONFIRME SEUS DADOS</h2>

          <dl className="mt-4 space-y-3 text-sm sm:text-base">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-600">Nome</dt>
              <dd className="font-bold text-gray-900">{NOME_CLIENTE}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-gray-600">CPF</dt>
              <dd className="font-bold text-gray-900">{CPF_CLIENTE}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={gerarPix}
            disabled={gerando}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#1e40af] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1a3696] disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-base"
          >
            {gerando ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Gerando PIX...
              </>
            ) : (
              'Confirmar dados e gerar PIX'
            )}
          </button>

          {erro && (
            <p role="alert" className="mt-3 text-center text-sm font-medium text-red-600">
              {erro}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
