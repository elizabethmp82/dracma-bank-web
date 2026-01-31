'use client'

import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PrintIcon from '@mui/icons-material/Print'
import RefreshIcon from '@mui/icons-material/Refresh'
import CreditCardIcon from '@mui/icons-material/CreditCard'

import QRCode from 'react-qr-code'

import { listChildren, type Child } from '@/app/lib/childrenApi'
import { getActiveCardByChild, issueCard, type Card } from '@/app/lib/cardsApi'

const APP_URL ="http://191.252.110.78"

function shortToken(t: string) {
  if (!t) return ''
  return `${t.slice(0, 8)}…${t.slice(-6)}`
}

type BatchItem = {
  child: Child
  card: Card
  url: string
}

function CreditStyleCard({
  childName,
  token,
  walletUrl,
}: {
  childName: string
  token: string
  walletUrl: string
}) {
  return (
    <div
      className="db-card"
      style={{
        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
        background: 'linear-gradient(135deg, #0b1220 0%, #111f3a 45%, #1b2a4a 100%)',
      }}
    >
      {/* brilho/ondas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120px 80px at 18% 25%, rgba(255,255,255,0.10), transparent 60%),' +
            'radial-gradient(160px 120px at 85% 15%, rgba(255,255,255,0.08), transparent 60%),' +
            'radial-gradient(220px 140px at 70% 95%, rgba(255,255,255,0.06), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* faixa diagonal */}
      <div
        style={{
          position: 'absolute',
          width: '140%',
          height: '22%',
          left: '-20%',
          top: '55%',
          transform: 'rotate(-10deg)',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />

      <div className="db-card-inner" style={{ color: 'white', position: 'relative' }}>
        {/* topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '3.2mm', fontWeight: 800, letterSpacing: '0.2mm' }}>
              Dracma Bank
            </div>
            <div className="db-muted" style={{ fontSize: '2.6mm', marginTop: '0.6mm' }}>
              Carteirinha oficial
            </div>
          </div>

          {/* logo placeholder (troque depois por img) */}
          <div
            style={{
              width: '9mm',
              height: '9mm',
              borderRadius: '2mm',
              background: 'rgba(255,255,255,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '3.2mm',
            }}
            aria-label="Logo Dracma Bank"
          >
            DB
          </div>
        </div>

        {/* chip fake */}
        <div
          style={{
            marginTop: '4.2mm',
            width: '14mm',
            height: '10mm',
            borderRadius: '2mm',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
            border: '0.2mm solid rgba(255,255,255,0.15)',
          }}
        />

        {/* nome */}
        <div style={{ marginTop: '4.2mm' }}>
          <div className="db-muted" style={{ fontSize: '2.6mm' }}>
            Nome
          </div>
          <div
            style={{
              fontSize: '4.2mm',
              fontWeight: 900,
              lineHeight: 1.1,
              marginTop: '0.8mm',
              maxWidth: '70mm',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {childName}
          </div>
        </div>

        {/* rodapé: token + QR pequeno */}
        <div
          style={{
            position: 'absolute',
            left: '4.5mm',
            right: '4.5mm',
            bottom: '4.0mm',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '4mm',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="db-muted" style={{ fontSize: '2.4mm' }}>
              
            </div>

            <div
              className="db-mono"
              style={{
                fontSize: '2.8mm',
                opacity: 0.9,
                marginTop: '0.6mm',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '48mm',
              }}
            >
              {token ? shortToken(token) : ''}
            </div>

            <div className="db-muted" style={{ fontSize: '2.2mm', marginTop: '1.2mm' }}>
              Aponte a câmera para ver o saldo
            </div>
          </div>

          <div
            style={{
              background: 'white',
              borderRadius: '2mm',
              padding: '1.6mm',
              width: '16mm',
              height: '16mm',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {walletUrl ? (
              <QRCode value={walletUrl} size={56} />
            ) : (
              <span style={{ fontSize: '2.4mm', color: '#334155' }}>Sem QR</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TabsCartoes() {
  const [children, setChildren] = React.useState<Child[]>([])
  const [childId, setChildId] = React.useState('')

  const [activeCard, setActiveCard] = React.useState<Card | null>(null)

  const [loading, setLoading] = React.useState(false)
  const [working, setWorking] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const [printMode, setPrintMode] = React.useState<'single' | 'batch'>('single')
  const [batchItems, setBatchItems] = React.useState<BatchItem[]>([])
  const [batchMissingCount, setBatchMissingCount] = React.useState(0)

  const selectedChild = React.useMemo(
    () => children.find((c) => c.id === childId) || null,
    [children, childId]
  )

  const walletUrl = React.useMemo(() => {
    if (!activeCard?.token) return ''
    return `${APP_URL}/c/${activeCard.token}`
  }, [activeCard?.token])

  async function bootstrap() {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const list = await listChildren('')
      setChildren(list)
      if (list[0]?.id) setChildId(list[0].id)
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar crianças')
    } finally {
      setLoading(false)
    }
  }

  async function loadCard(forChildId?: string) {
    const id = forChildId || childId
    if (!id) return

    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const card = await getActiveCardByChild(id)
      setActiveCard(card)
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar cartão')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    bootstrap()
  }, [])

  React.useEffect(() => {
    if (childId) loadCard(childId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId])

  async function handleGenerateCard() {
    if (!childId) return
    setWorking(true)
    setError(null)
    setSuccess(null)
    try {
      const created = await issueCard(childId) // sua função existente
      setSuccess(`Cartão gerado: ${shortToken(created.token)}`)
      await loadCard(childId)
    } catch (e: any) {
      setError(e?.message || 'Erro ao gerar cartão')
    } finally {
      setWorking(false)
    }
  }

  async function handleCopyLink() {
    if (!walletUrl) return
    try {
      await navigator.clipboard.writeText(walletUrl)
      setSuccess('Link copiado!')
    } catch {
      setError('Não consegui copiar. Copie manualmente.')
    }
  }

  function handleOpenWallet() {
    if (!walletUrl) return
    window.open(walletUrl, '_blank')
  }

  function handlePrintSingle() {
    if (!walletUrl || !selectedChild || !activeCard?.token) return
    setPrintMode('single')
    setTimeout(() => window.print(), 120)
  }

  async function handlePrintBatch() {
    setWorking(true)
    setError(null)
    setSuccess(null)

    try {
      // busca cartão ativo para cada criança (SEM criar automaticamente)
      const results = await Promise.all(
        children.map(async (ch) => {
          const card = await getActiveCardByChild(ch.id)
          if (!card?.token) return null
          return {
            child: ch,
            card,
            url: `${APP_URL}/c/${card.token}`,
          } as BatchItem
        })
      )

      const items = results.filter(Boolean) as BatchItem[]
      const missing = children.length - items.length

      setBatchItems(items)
      setBatchMissingCount(missing)

      if (items.length === 0) {
        setError('Nenhum cartão encontrado para imprimir. Gere os cartões antes.')
        return
      }

      setPrintMode('batch')

      // garante render antes do print
      setTimeout(() => window.print(), 180)

      if (missing > 0) {
        setSuccess(`Imprimindo ${items.length} cartões. ${missing} crianças ainda sem cartão.`)
      } else {
        setSuccess(`Imprimindo ${items.length} cartões.`)
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao preparar impressão em lote')
    } finally {
      setWorking(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <style>{`
      #print-root { display: none; }
        @media print {
          body * { visibility: hidden !important; }
              #print-root { display: block; }
          /* Mostra SOMENTE a área de impressão */
          #print-root, #print-root * {
            visibility: visible !important;
          }

          #print-root {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white;
          }
        }

        /* cartão em tamanho real (padrão cartão de crédito) */
        .db-card {
          width: 85.6mm;
          height: 53.98mm;
          border-radius: 3.5mm;
          overflow: hidden;
          position: relative;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .db-card-inner {
          width: 100%;
          height: 100%;
          padding: 4.5mm;
          box-sizing: border-box;
        }

        .db-muted { opacity: 0.85; }

        .db-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }

        /* impressão em lote: grid de cartões */
        .batch-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6mm;
          padding: 10mm;
          box-sizing: border-box;
          align-items: start;
          justify-items: center;
        }

        .no-break {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .page-break {
          break-after: page;
          page-break-after: always;
          height: 0;
        }

        /* responsivo fora do print */
        @media screen and (max-width: 900px) {
          .batch-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media screen and (max-width: 600px) {
          .batch-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Paper sx={{ p: 2 }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6">Cartões</Typography>
            <Typography variant="body2" color="text.secondary">
              Gere o cartão (token) e imprima o cartão físico com QRCode para a carteira online.
            </Typography>
          </Box>

          <Button startIcon={<RefreshIcon />} onClick={() => loadCard(childId)} disabled={loading || !childId}>
            Atualizar
          </Button>
        </Stack>

        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {success && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success">{success}</Alert>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {/* Seleção */}
          <TextField
            select
            label="Selecione a criança"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            fullWidth
            disabled={loading}
          >
            {children.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Status */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography fontWeight={800}>
                  {selectedChild ? selectedChild.name : '—'}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {activeCard ? `Token: ${shortToken(activeCard.token)}` : 'Sem cartão ainda'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                {loading ? (
                  <CircularProgress size={22} />
                ) : activeCard ? (
                  <Chip size="small" label="CARTÃO OK" />
                ) : (
                  <Chip size="small" label="SEM CARTÃO" />
                )}

                <Button
                  variant="contained"
                  startIcon={<CreditCardIcon />}
                  onClick={handleGenerateCard}
                  disabled={working || loading || !childId || !!activeCard}
                  title={activeCard ? 'Já existe cartão' : 'Gerar cartão'}
                >
                  Gerar cartão
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Link */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Carteira online
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
              <TextField
                label="Link"
                value={walletUrl || ''}
                fullWidth
                InputProps={{ readOnly: true }}
                placeholder="Gere um cartão para aparecer o link"
              />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="Copiar link">
                  <span>
                    <IconButton onClick={handleCopyLink} disabled={!walletUrl}>
                      <ContentCopyIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Abrir carteira">
                  <span>
                    <IconButton onClick={handleOpenWallet} disabled={!walletUrl}>
                      <OpenInNewIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>

          {/* Cartão físico */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography fontWeight={800}>Cartão físico</Typography>
                <Typography variant="body2" color="text.secondary">
                  Formato cartão de crédito. Para ficar perfeito: escala 100% + “imprimir plano de fundo”.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintBatch}
                  disabled={working || loading || children.length === 0}
                  title="Imprime somente crianças que já têm cartão"
                >
                  Imprimir em lote
                </Button>

                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintSingle}
                  disabled={!walletUrl || !selectedChild || !activeCard?.token}
                >
                  Imprimir
                </Button>
              </Stack>
            </Stack>

            {batchMissingCount > 0 && (
              <Box sx={{ mt: 1 }}>
                <Alert severity="info">
                  No lote: {batchMissingCount} criança(s) ainda sem cartão (não serão impressas).
                </Alert>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* PREVIEW na tela (sempre mostra o selecionado) */}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CreditStyleCard
                childName={selectedChild?.name || 'Selecione uma criança'}
                token={activeCard?.token || ''}
                walletUrl={walletUrl || ''}
              />
            </Box>
          </Paper>
        </Stack>
      </Paper>

      {/* ÁREA DE IMPRESSÃO (single ou batch) */}
      <Box id="print-root">
        {/* SINGLE */}
        {printMode === 'single' && selectedChild && activeCard?.token && walletUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CreditStyleCard
              childName={selectedChild.name}
              token={activeCard.token}
              walletUrl={walletUrl}
            />
          </Box>
        )}

        {/* BATCH */}
        {printMode === 'batch' && (
          <div className="batch-grid">
            {batchItems.map((it, idx) => (
              <div key={it.child.id} className="no-break">
                <CreditStyleCard
                  childName={it.child.name}
                  token={it.card.token}
                  walletUrl={it.url}
                />

                {/* opcional: quebra página a cada 9 cartões (3x3) */}
                {(idx + 1) % 9 === 0 && <div className="page-break" />}
              </div>
            ))}
          </div>
        )}
      </Box>
    </Box>
  )
}
