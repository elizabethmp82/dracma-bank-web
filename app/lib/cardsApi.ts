import { API_URL } from './api'

export type Card = {
  id: string
  child_id: string
  token: string
  status: 'ACTIVE' | 'BLOCKED' | 'REPLACED'
  created_at: string
  updated_at: string
}

export async function getActiveCardByChild(childId: string): Promise<Card | null> {
  const res = await fetch(`${API_URL}/admin/cards/by-child/${childId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Falha ao buscar cartão')
  return res.json()
}

export async function issueCard(childId: string): Promise<Card> {
  const res = await fetch(`${API_URL}/admin/cards/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ childId }),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Falha ao emitir cartão')
  }
  return res.json()
}
