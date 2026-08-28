import AdvanceButton from '@/components/advance-button'

const bannerUrl =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iasfh2eVCW6DIkRti5XFstDOJNPjzF.png'

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:px-16">
        <div className="order-2 flex max-w-xl flex-1 flex-col items-start gap-7 lg:order-1">
          <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Limpe seu nome
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="max-w-lg text-balance font-serif text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Um novo começo começa aqui.
            </h1>
            <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Consulte sua situação de forma simples, segura e online. Estamos aqui para ajudar você a dar o próximo passo.
            </p>
          </div>

          <AdvanceButton />

          <p className="text-sm leading-6 text-muted-foreground">
            Seus dados são tratados com segurança e privacidade.
          </p>
        </div>

        <div className="order-1 flex-1 lg:order-2">
          <div className="overflow-hidden rounded-[2rem] bg-secondary shadow-2xl shadow-primary/10 ring-1 ring-border">
            <img
              src={bannerUrl}
              alt="Pessoa segurando um celular com a tela do serviço Limpe seu Nome"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export const dynamic = 'force-static'
