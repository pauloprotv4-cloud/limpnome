'use client'

// Dados genéricos exibidos ao lead (não temos API de CPF).
const CPF_CLIENTE = '000.000.000-00'
const SCORE = 365
const SCORE_MAXIMO = 1000

// Arco do medidor: comprimento total da trilha e deslocamento proporcional ao score.
const COMPRIMENTO_ARCO = 147.6548547187203
const OFFSET = COMPRIMENTO_ARCO - (SCORE / SCORE_MAXIMO) * COMPRIMENTO_ARCO

export default function AnaliseClient() {
  return (
    <section aria-label="Resultado da análise" className="w-full max-w-[640px] space-y-3 sm:space-y-4">
      <div className="w-fit max-w-full rounded-full border border-gray-100 bg-white px-4 py-2.5 shadow-sm sm:px-6 sm:py-3.5">
        <p className="text-sm font-bold text-gray-900 sm:text-base">Análise concluída!</p>
      </div>

      <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-5">
        <p className="text-sm leading-relaxed text-gray-800 sm:text-base">
          Identificamos <span className="font-bold text-gray-900">4 dívidas ativas</span> no sistema. Os valores variam
          entre <span className="font-bold text-gray-900">R$ 1.728,74</span> a{' '}
          <span className="font-bold text-gray-900">R$ 5.278,23</span> de dívida{' '}
          <span className="font-bold text-gray-900">em seu CPF</span>.
        </p>
      </div>

      <div className="w-fit max-w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5 shadow-sm sm:px-6 sm:py-5">
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">Situação para CPF:</p>
        <p className="mt-1 text-base font-bold text-[#1e40af] sm:text-lg">{CPF_CLIENTE}</p>
        <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg">NEGATIVADO.</p>
      </div>

      <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-5">
        <p className="text-sm leading-relaxed text-gray-800 sm:text-base">
          Segundo nossos registros, seu <span className="font-bold text-gray-900">SCORE</span> é considerado muito baixo{' '}
          <span className="font-bold text-gray-900">(alto risco para crédito)</span>:
        </p>
      </div>

      <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <p className="text-sm font-medium text-gray-500 sm:text-base">Serasa Score</p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold leading-tight text-[#0f172a] sm:text-2xl">
              Seu score está
              <br />
              baixo
            </p>
          </div>
          <div className="flex flex-col items-center">
            <svg
              height="60"
              width="112"
              viewBox="0 0 112 60"
              className="overflow-visible"
              aria-label={`Score ${SCORE} de ${SCORE_MAXIMO}`}
            >
              <path
                d="M 4 56 A 47 47 0 0 1 108 56"
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 4 56 A 47 47 0 0 1 108 56"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={COMPRIMENTO_ARCO}
                strokeDashoffset={OFFSET}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <p className="-mt-4 text-2xl font-bold text-[#0f172a] sm:-mt-5 sm:text-3xl">{SCORE}</p>
            <p className="text-sm text-gray-500 sm:text-base">de {SCORE_MAXIMO}</p>
          </div>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:px-6 sm:py-5">
        <p className="text-sm leading-relaxed text-gray-800 sm:text-base">
          Você deseja verificar se existe algum acordo com desconto disponível para você?
        </p>
      </div>

      <button
        type="button"
        className="block w-full rounded-full bg-[#1e40af] px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#1a3696] sm:px-6 sm:py-3.5 sm:text-base"
      >
        BUSCAR ACORDO
      </button>
    </section>
  )
}
