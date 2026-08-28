'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdvanceButton() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)

  function handleClick() {
    setCarregando(true)
    router.push('/renegociar')
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={carregando}
        className="group mt-7 inline-flex min-h-14 w-full max-w-md items-center justify-center rounded-full bg-[#2848b8] px-7 text-base font-bold tracking-wide text-white transition-colors hover:bg-[#1f3da3] focus-visible:ring-2 focus-visible:ring-[#2848b8] focus-visible:ring-offset-4 focus-visible:outline-none disabled:opacity-70"
      >
        {carregando ? 'ACESSANDO...' : 'ACESSAR AGORA'}
        <ArrowRight className="ml-3 size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </div>
  )
}
