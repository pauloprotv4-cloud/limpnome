'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function AdvanceButton() {
  const [avancou, setAvancou] = useState(false)

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setAvancou(true)}
        className="group mt-7 inline-flex min-h-14 w-full max-w-md items-center justify-center rounded-full bg-[#2848b8] px-7 text-base font-bold tracking-wide text-white transition-colors hover:bg-[#1f3da3] focus-visible:ring-2 focus-visible:ring-[#2848b8] focus-visible:ring-offset-4 focus-visible:outline-none"
        aria-describedby="mensagem-avanco"
      >
        {avancou ? 'ACESSANDO...' : 'ACESSAR AGORA'}
        <ArrowRight className="ml-3 size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
      <p id="mensagem-avanco" className="min-h-6 text-sm font-medium text-accent-foreground" aria-live="polite">
        {avancou ? 'Ótimo! O próximo passo está pronto para você.' : ''}
      </p>
    </div>
  )
}
