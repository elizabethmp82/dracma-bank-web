import { API_URL } from './api'

export type Child = {
  id: string
  name: string
  photo_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function listChildren(search?: string): Promise<Child[]> {
  const url = new URL(`${API_URL}/admin/children`)
  if (search && search.trim()) url.searchParams.set('search', search.trim())

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error('Falha ao carregar crianças')
  return res.json()
}

export async function createChild(payload: { name: string; photo_url?: string }): Promise<Child> {
  const res = await fetch(`${API_URL}/admin/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Falha ao cadastrar criança')
  }
  return res.json()
}

export async function updateChild(
  id: string,
  payload: { name: string; photo_url?: string }
): Promise<Child> {
  const res = await fetch(`${API_URL}/admin/children/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Falha ao editar criança')
  }
  return res.json()
}

export async function deleteChild(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/children/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) {
    const msg = await res.text()
    throw new Error(msg || 'Falha ao excluir criança')
  }
}

