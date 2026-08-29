'use client'

import { AlertTriangle } from 'lucide-react'

const CODIGO_ACORDO = 'XXJIN-Jd8--'

export default function PagamentoClient({
  nome = 'CLIENTE',
  cpf = '000.000.000-00',
}: {
  nome?: string
  cpf?: string
}) {
  const NOME_CLIENTE = nome
  const CPF_CLIENTE = cpf

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
        </dl>
      </div>

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
          className="mt-6 w-full rounded-full bg-[#1e40af] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-base"
        >
          Confirmar dados e gerar PIX
        </button>
      </div>
    </section>
  )
}
