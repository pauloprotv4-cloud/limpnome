import { Headphones, Moon } from 'lucide-react'
import EmpresasClient from '@/components/empresas-client'
import { lerConsulta } from '@/lib/consulta-server'

export default async function EmpresasPage() {
  const dados = await lerConsulta()

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
        <EmpresasClient nome={dados.nome} />
      </main>
    </div>
  )
}
