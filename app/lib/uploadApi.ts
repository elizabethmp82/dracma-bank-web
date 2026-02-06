const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export async function uploadPhoto(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch(`${API_URL}/admin/uploads/photo`, {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Falha no upload')
  }

  const data = await res.json()
  return data.url as string
}
