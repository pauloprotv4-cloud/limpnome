'use client'

import { useState } from 'react'

function formatarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function CpfForm() {
  const [cpf, setCpf] = useState('')
  const [enviando, setEnviando] = useState(false)

  const valido = cpf.replace(/\D/g, '').length === 11

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valido) return
    setEnviando(true)
    window.location.href = 'https://safeoffonline.com/acessar?channel=online_store'
  }

  return (
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
        disabled={!valido || enviando}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1e40af] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1a3696] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-5 sm:py-4 sm:text-lg"
      >
        {enviando ? 'Processando...' : 'Continuar'}
      </button>
    </form>
  )
}
