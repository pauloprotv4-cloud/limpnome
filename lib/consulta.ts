// Helpers puros (seguros para client e server) da consulta de CPF.

export const COOKIE_CONSULTA = 'cpf-consulta'

export type ConsultaData = {
  nome: string
  cpf: string
  nascimento: string
  idade: number
}

// Dados genéricos usados como fallback quando não há consulta disponível.
export const CONSULTA_PADRAO: ConsultaData = {
  nome: 'CLIENTE',
  cpf: '000.000.000-00',
  nascimento: '01/01/1985',
  idade: 40,
}

export function normalizarCpf(valor: unknown) {
  return String(valor ?? '')
    .replace(/\D/g, '')
    .slice(0, 11)
}

export function formatarCpfCompleto(valor: string) {
  return normalizarCpf(valor)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function validarCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== Number(cpf[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  digit = (sum * 10) % 11
  if (digit === 10) digit = 0

  return digit === Number(cpf[10])
}

// Aceita "YYYY-MM-DD", ISO datetime ou "DD/MM/YYYY" e devolve
// a data em DD/MM/YYYY junto com a idade calculada.
export function interpretarNascimento(valor: string): { display: string; idade: number } {
  const raw = String(valor ?? '').trim()
  let ano = 0
  let mes = 0
  let dia = 0

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/)

  if (iso) {
    ano = Number(iso[1])
    mes = Number(iso[2])
    dia = Number(iso[3])
  } else if (br) {
    dia = Number(br[1])
    mes = Number(br[2])
    ano = Number(br[3])
  } else {
    return { display: raw || CONSULTA_PADRAO.nascimento, idade: 0 }
  }

  const display = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`

  const hoje = new Date()
  let idade = hoje.getFullYear() - ano
  const difMes = hoje.getMonth() + 1 - mes
  if (difMes < 0 || (difMes === 0 && hoje.getDate() < dia)) idade--

  return { display, idade: idade > 0 && idade < 130 ? idade : 0 }
}
