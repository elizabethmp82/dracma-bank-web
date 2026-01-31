import { API_URL } from '@/app/lib/api'

type PublicCardResponse = {
  child: { id: string; name: string; photo_url: string | null }
  card: { token: string; status: string }
  balance: number
  lastEntries: {
    id: string
    type: 'CREDIT' | 'DEBIT'
    amount: number
    reason: string
    created_at: string
  }[]
}

async function getCard(token: string): Promise<
  | { ok: true; data: PublicCardResponse }
  | { ok: false; status: number; message: string }
> {
  const res = await fetch(
    `${API_URL}/public/card/${encodeURIComponent(token)}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    let message = 'Não foi possível carregar a carteirinha.'
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // ignore
    }
    return { ok: false, status: res.status, message }
  }

  const data = await res.json()
  return { ok: true, data }
}

export default async function CardPublicPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  // ✅ Next 16: params pode ser Promise
  const { token } = await params

  const result = await getCard(token)

  if (!result.ok) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: 16 }}>
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            background: 'white',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Carteirinha Dracma Bank</h2>
          <p style={{ margin: 0 }}>
            <b>Problema:</b> {result.message}
          </p>
          <p style={{ color: '#64748b' }}>
            Se você é líder, gere/abra o cartão pelo painel Admin.
          </p>
        </div>
      </div>
    )
  }

  const data = result.data

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: 16 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div
          style={{
            borderRadius: 16,
            padding: 20,
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Dracma Bank</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>
                {data.child.name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                Saldo atual
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 2 }}>
                {data.balance}{' '}
                <span style={{ fontSize: 14, opacity: 0.8 }}>Dracmas</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Carteirinha</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.9, marginTop: 6 }}>
                {data.card.token.slice(0, 8)}…{data.card.token.slice(-6)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Últimas movimentações
          </div>

          {data.lastEntries.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 12, padding: 12, color: '#475569' }}>
              Nenhuma movimentação ainda.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {data.lastEntries.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {e.type === 'CREDIT' ? 'Entrada' : 'Saída'} • {e.reason}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {new Date(e.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  <div style={{ fontWeight: 800 }}>
                    {e.type === 'CREDIT' ? '+' : '-'}
                    {e.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: '#64748b' }}>
          Dica: salve essa tela na tela inicial do celular para abrir rápido.
        </div>
      </div>
    </div>
  )
}
