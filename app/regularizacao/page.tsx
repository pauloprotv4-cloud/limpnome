import { Suspense } from 'react'
import RegularizacaoClient from '@/components/regularizacao-client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegularizacaoClient />
    </Suspense>
  )
}
