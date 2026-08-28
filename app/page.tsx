import AdvanceButton from '@/components/advance-button'

const bannerUrl =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iasfh2eVCW6DIkRti5XFstDOJNPjzF.png'

export default function Page() {
  return (
    <main className="min-h-screen bg-[#333333] px-1.5 py-4 text-[#1e40af] sm:px-4">
      <section className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[640px] overflow-hidden rounded-lg bg-white shadow-sm">
        <img
          src={bannerUrl}
          alt="Pessoa acessando a plataforma Desenrola Brasil no celular"
          className="block h-auto w-full"
        />

        <div className="flex flex-col items-center px-5 py-10 text-center sm:px-8">
          <div className="relative flex h-16 w-16 items-center justify-center" aria-label="Logo Desenrola Brasil">
            <span className="absolute left-0 top-0 h-12 w-10 rounded-lg bg-[#ffd000]" />
            <span className="absolute left-3 top-3 h-9 w-9 rounded-full bg-[#0057d9]" />
            <span className="absolute right-0 top-0 h-12 w-3 -skew-x-12 rounded-sm bg-[#ed1c24]" />
            <span className="absolute bottom-0 right-1 h-6 w-6 rounded-full bg-[#22a447]" />
          </div>

          <h1 className="mt-5 text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            <span className="text-[#1e40af]">DESENROLA</span>
            <br />
            <span className="text-[#22c55e]">BRASIL</span>
          </h1>

          <p className="mt-7 max-w-md text-base font-bold leading-snug sm:text-lg">
            O Programa Desenrola Brasil possibilita a renegociação de dívidas com descontos de até 99%
          </p>
          <p className="mt-6 text-sm leading-relaxed text-gray-700 sm:text-base">
            Clique no botão abaixo para acessar a plataforma
          </p>
          <AdvanceButton />

          <footer className="mt-7 w-full border-t border-gray-200 pt-5 text-xs font-semibold text-[#1e40af] sm:mt-8 sm:pt-6 sm:text-sm">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:gap-8" aria-label="Links institucionais">
              <a href="#privacidade" className="hover:underline">Política de Privacidade</a>
              <a href="#termos" className="hover:underline">Termos de Uso</a>
              <a href="#cookies" className="hover:underline">Cookies</a>
              <a href="#sobre" className="basis-full hover:underline">Sobre Nós</a>
            </nav>
            <p className="mx-auto mt-6 max-w-lg text-[8px] font-normal leading-tight text-gray-300">
              Aviso importante: este é um site privado e independente, sem qualquer vínculo, patrocínio ou autorização do Governo Federal, do programa oficial Desenrola Brasil, do gov.br, da Serasa ou de qualquer instituição financeira. Não somos um canal oficial e não representamos órgãos públicos.
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}

export const dynamic = 'force-static'
