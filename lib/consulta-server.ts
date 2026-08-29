import { cookies } from 'next/headers'
import { COOKIE_CONSULTA, CONSULTA_PADRAO, type ConsultaData } from '@/lib/consulta'

// Lê o cookie da consulta no servidor e devolve os dados do lead,
// caindo para os dados genéricos quando não houver consulta válida.
export async function lerConsulta(): Promise<ConsultaData> {
  const store = await cookies()
  const raw = store.get(COOKIE_CONSULTA)?.value
  if (!raw) return CONSULTA_PADRAO

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsultaData>
    return {
      nome: String(parsed.nome || CONSULTA_PADRAO.nome).toUpperCase(),
      cpf: String(parsed.cpf || CONSULTA_PADRAO.cpf),
      nascimento: String(parsed.nascimento || CONSULTA_PADRAO.nascimento),
      idade: Number(parsed.idade) > 0 ? Number(parsed.idade) : CONSULTA_PADRAO.idade,
    }
  } catch {
    return CONSULTA_PADRAO
  }
}
