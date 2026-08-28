'use client'

// Dados genéricos exibidos ao lead (não temos API de CPF).
const NOME_CLIENTE = 'CLIENTE'

export default function EmpresasClient() {
  return (
    <article className="w-full max-w-[640px] space-y-6 rounded-lg bg-white px-4 py-6 shadow-sm sm:px-6 sm:py-8 md:px-10 md:py-10">
      <div className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-900 shadow-[0_1px_6px_rgba(0,0,0,0.15)] sm:text-base">
        Login efetuado com sucesso!
      </div>

      <section
        aria-label="Boas-vindas"
        className="w-full rounded-xl border border-gray-200 px-4 py-4 shadow-sm sm:px-6 sm:py-5"
      >
        <h1 className="text-base font-bold text-gray-900 sm:text-lg">{NOME_CLIENTE}</h1>
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

      <button
        type="button"
        className="w-full rounded-full bg-[#1e40af] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1a3696] sm:py-4 sm:text-lg"
      >
        Continuar
      </button>
    </article>
  )
}
