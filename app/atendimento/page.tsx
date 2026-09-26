export const dynamic = 'force-dynamic'

type AtendimentoPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: AtendimentoPageProps) {
  const params = await searchParams
  const iframeParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') iframeParams.set(key, value)
    else if (Array.isArray(value) && value[0]) iframeParams.set(key, value[0])
  }

  const query = iframeParams.toString()

  return (
    <main className="h-dvh w-full overflow-hidden bg-[#f0f2f5]">
      <iframe
        title="Atendimento Justifica Eleitoral"
        src={`/desen/atendimento-else/index.html${query ? `?${query}` : ''}`}
        className="h-full w-full border-0"
      />
    </main>
  )
}
