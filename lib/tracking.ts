// Captura e preserva parâmetros de rastreamento (UTMs + click IDs) para
// integração com a Utmify via gateway Paradise. Client-side apenas.

const STORE_KEY = 'utmify_params'

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

const EXTRA_KEYS = [
  'src',
  'sck',
  'gclid',
  'fbclid',
  'ttclid',
  'msclkid',
  'xcod',
  'leadId',
]

export type Utms = Record<string, string>

// Captura os parâmetros da URL atual e faz merge com o que já está salvo.
export function capturarUtms(): Utms {
  if (typeof window === 'undefined') return {}

  let stored: Utms = {}
  try {
    stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
  } catch {
    stored = {}
  }

  const params = new URLSearchParams(window.location.search)
  let updated = false

  params.forEach((value, key) => {
    if (!value) return
    const isTrack = key.startsWith('utm_') || EXTRA_KEYS.includes(key)
    if (isTrack && stored[key] !== value) {
      stored[key] = value
      updated = true
    }
  })

  if (updated) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(stored))
    } catch {
      // ignore
    }
  }

  return stored
}

// Lê os parâmetros salvos (merge com a URL atual, caso ainda existam).
export function lerUtms(): Utms {
  if (typeof window === 'undefined') return {}

  let stored: Utms = {}
  try {
    stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
  } catch {
    stored = {}
  }

  const params = new URLSearchParams(window.location.search)
  params.forEach((value, key) => {
    if (!value) return
    if (key.startsWith('utm_') || EXTRA_KEYS.includes(key)) stored[key] = value
  })

  return stored
}

// Monta o objeto tracking no formato aceito pela Paradise/Utmify.
export function montarTracking(utms: Utms): Record<string, string> {
  const tracking: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    if (utms[key]) tracking[key] = utms[key]
  }
  return tracking
}
