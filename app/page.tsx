import AdvanceButton from '@/components/advance-button'

const bannerUrl =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iasfh2eVCW6DIkRti5XFstDOJNPjzF.png'

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-foreground sm:px-6">
      <section className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,37,64,0.12)] ring-1 ring-slate-200">
        <div className="flex min-h-64 items-center justify-center bg-slate-100 p-4 sm:min-h-80 sm:p-8">
          <img
            src={bannerUrl}
            alt="Pessoa segurando um celular com a tela do serviço Limpe seu Nome"
            className="max-h-80 w-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-5 px-6 py-8 text-center sm:px-10 sm:py-10">
          <h1 className="text-balance font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Um novo começo começa aqui.
          </h1>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-600">
            Consulte sua situação de forma simples, segura e online. Dê o próximo passo quando estiver pronto.
          </p>
          <AdvanceButton />
        </div>
      </section>
    </main>
  )
}

export const dynamic = 'force-static'
