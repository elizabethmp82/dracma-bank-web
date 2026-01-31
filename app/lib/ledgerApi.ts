import { API_URL } from './api'

export type LedgerEntry = {
  id: string
  child_id: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  reason: string
  created_at: string
  updated_at: string
}

export async function createLedgerEntry(payload: {
  childId: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  reason: string
}): Promise<LedgerEntry> {
  const res = await fetch(`${API_URL}/admin/ledger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Falha ao lançar Dracmas')
  }

  return res.json()
}
