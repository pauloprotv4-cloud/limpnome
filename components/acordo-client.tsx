'use client'

import { useEffect, useState } from 'react'

// Dados genéricos exibidos ao lead (não temos API de CPF).
const NOME_CLIENTE = 'CLIENTE'
const CPF_CLIENTE = '000.000.000-00'

export default function AcordoClient() {
  const [encontrado, setEncontrado] = useState(false)

  // Simula a verificação de acordos antes de revelar o resultado.
  useEffect(() => {
    const t = window.setTimeout(() => setEncontrado(true), 3000)
    return () => window.clearTimeout(t)
  }, [])

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

          <button
            type="button"
            className="block w-full rounded-full bg-[#1e40af] px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#1a3696] sm:px-6 sm:py-3.5 sm:text-base"
          >
            VER ACORDO
          </button>
        </>
      )}
    </section>
  )
}
