'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function AdvanceButton() {
  const [avancou, setAvancou] = useState(false)

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => setAvancou(true)}
        className="group inline-flex min-h-14 items-center gap-4 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:outline-none active:translate-y-0"
        aria-describedby="mensagem-avanco"
      >
        {avancou ? 'Vamos começar' : 'Avançar'}
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
      <p id="mensagem-avanco" className="min-h-6 text-sm font-medium text-accent-foreground" aria-live="polite">
        {avancou ? 'Ótimo! O próximo passo está pronto para você.' : ''}
      </p>
    </div>
  )
}
