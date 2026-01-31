import { API_URL } from './api'

export type ChildSummary = {
  child: { id: string; name: string; photo_url: string | null }
  balance: number
  entries: {
    id: string
    type: 'CREDIT' | 'DEBIT'
    amount: number
    reason: string
    created_at: string
  }[]
}

export async function getChildSummary(childId: string): Promise<ChildSummary> {
  const res = await fetch(`${API_URL}/admin/children/${childId}/summary`, { cache: 'no-store' })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Falha ao carregar resumo')
  }
  return res.json()
}
