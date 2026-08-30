import { Suspense } from 'react'
import AtendimentoClient from '@/components/atendimento-client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AtendimentoClient />
    </Suspense>
  )
}
