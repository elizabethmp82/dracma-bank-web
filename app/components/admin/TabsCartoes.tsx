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
import RefreshIcon from '@mui/icons-material/Refresh'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

import QRCode from 'react-qr-code'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { listChildren, type Child } from '@/app/lib/childrenApi'
import { getActiveCardByChild, issueCard, type Card } from '@/app/lib/cardsApi'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ✅ 2 colunas x 3 linhas = 6 por página
const PER_PAGE = 8

function shortToken(t: string) {
  if (!t) return ''
  return `${t.slice(0, 8)}…${t.slice(-6)}`
}

type BatchItem = {
  child: Child
  card: Card
  url: string
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
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
  // ✅ Mantém a cor “azul” que você já está usando
  return (
    <div
      className="db-card"
      style={{
        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 45%, #60a5fa 100%)',
      }}
    >
      {/* brilho/ondas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(140px 90px at 18% 25%, rgba(255,255,255,0.22), transparent 60%),' +
            'radial-gradient(180px 130px at 85% 15%, rgba(255,255,255,0.18), transparent 60%),' +
            'radial-gradient(220px 140px at 70% 95%, rgba(255,255,255,0.14), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* faixa diagonal */}
      {/* <div
        style={{
          position: 'absolute',
          width: '140%',
          height: '22%',
          left: '-20%',
          top: '55%',
          transform: 'rotate(-10deg)',
          background: 'linear-gradient(90deg, rgba(250,204,21,0.28), rgba(250,204,21,0.10))',
          pointerEvents: 'none',
        }}
      /> */}

      <div className="db-card-inner" style={{ color: 'white', position: 'relative' }}>
        {/* topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '3.4mm', fontWeight: 900 }}>
              Dracma Bank 💰
            </div>
          </div>

          {/* logo */}
          <div
            style={{
              width: '9mm',
              height: '9mm',
              borderRadius: '3mm',
              background: 'rgba(250,204,21,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '3.2mm',
              color: '#1e3a8a',
              boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
            }}
            aria-label="Logo Dracma Bank"
          >
            DB
          </div>
        </div>

        {/* chip */}
        <div
          style={{
            marginTop: '4.2mm',
            width: '14mm',
            height: '10mm',
            borderRadius: '3mm',
            background: 'rgba(255,255,255,0.22)',
            border: '0.2mm solid rgba(255,255,255,0.25)',
          }}
        />

        {/* nome */}
        <div style={{ marginTop: '4.2mm' }}>
          <div className="db-muted" style={{ fontSize: '2.6mm' }}>
            Nome
          </div>

          <div
            style={{
              fontSize: '4.3mm',
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

        {/* rodapé */}
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
            

            <div
              className="db-mono"
              style={{
                fontSize: '2.8mm',
                opacity: 0.95,
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
              Aponte a câmera para ver o saldo ⭐
            </div>
          </div>

          <div
            style={{
              background: 'white',
              borderRadius: '4mm',
              padding: '1.8mm',
              width: '16.5mm',
              height: '16.5mm',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(0,0,0,0.16)',
              border: '0.3mm solid rgba(250,204,21,0.9)',
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

  // PDF render state
  const pdfRootRef = React.useRef<HTMLDivElement | null>(null)
  const [pdfPages, setPdfPages] = React.useState<BatchItem[][]>([])
  const [pdfGenerating, setPdfGenerating] = React.useState(false)

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
      const created = await issueCard(childId)
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

  // ✅ NOVO: BAIXAR PDF EM LOTE (2 colunas, 6 por página)
  async function handleDownloadPdfBatch() {
    if (children.length === 0) return

    setPdfGenerating(true)
    setWorking(true)
    setError(null)
    setSuccess(null)

    try {
      // 1) montar itens (somente quem tem cartão ativo)
      const results = await Promise.all(
        children.map(async (ch) => {
          try {
            const card = await getActiveCardByChild(ch.id)
            if (!card?.token) return null
            const url = `${APP_URL}/c/${card.token}`
            if (!ch?.name || !card?.token || !url) return null
            return { child: ch, card, url } as BatchItem
          } catch {
            return null
          }
        })
      )

      const items = results.filter(Boolean) as BatchItem[]
      if (items.length === 0) {
        setError('Nenhum cartão encontrado para gerar PDF. Gere os cartões antes.')
        return
      }

      const pages = chunk(items, PER_PAGE)

      // 2) renderizar as páginas no DOM “offscreen”
      setPdfPages(pages)

      // 3) esperar o React realmente desenhar tudo
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

      const root = pdfRootRef.current
      if (!root) {
        setError('Falha ao montar área de PDF.')
        return
      }

      const pageEls = Array.from(root.querySelectorAll<HTMLElement>('[data-pdf-page="1"]'))
      if (pageEls.length === 0) {
        setError('Não encontrei páginas para capturar no PDF.')
        return
      }

      // 4) gerar o PDF
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const margin = 10
      const pageW = 210
      const pageH = 297
      const drawW = pageW - margin * 2
      const drawH = pageH - margin * 2

      for (let i = 0; i < pageEls.length; i++) {
        const el = pageEls[i]

        // html2canvas com escala boa pra QRCode ficar legível
        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        })

        const imgData = canvas.toDataURL('image/png')

        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', margin, margin, drawW, drawH)
      }

      pdf.save(`dracma-cartoes-${items.length}.pdf`)
      setSuccess(`PDF gerado com ${items.length} cartão(ões).`)
    } catch (e: any) {
      setError(e?.message || 'Erro ao gerar PDF')
    } finally {
      setWorking(false)
      // mantém offscreen montado só enquanto gera
      setPdfGenerating(false)
      setPdfPages([])
    }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <style>{`
        /* cartão tamanho real */
        .db-card {
          width: 85.6mm;
          height: 53.98mm;
          border-radius: 6mm;
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

        /* ✅ área offscreen do PDF */
        .pdf-offscreen {
          position: fixed;
          left: -99999px;
          top: 0;
          width: 210mm;
          background: white;
        }

        /* ✅ página A4 “real” dentro do html2canvas */
        .pdf-page {
          width: 210mm;
          height: 297mm;
          background: #fff;
          box-sizing: border-box;
          padding: 10mm;
        }

        /* ✅ grid 2 colunas, 6 por página */
        .pdf-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6mm;
          align-items: start;
          justify-items: center;
        }
      `}</style>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6">Cartões</Typography>
            <Typography variant="body2" color="text.secondary">
              Gere o cartão (token) e baixe um PDF em lote com 6 cartões por página.
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
                >
                  Gerar cartão
                </Button>
              </Stack>
            </Stack>
          </Paper>

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
                  PDF em lote: 2 colunas × 3 linhas (6 por página).
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleDownloadPdfBatch}
                  disabled={working || loading || children.length === 0}
                >
                  Baixar PDF (lote)
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

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

      {/* ✅ OFFSCREEN: páginas do PDF (renderiza só durante a geração) */}
      {pdfGenerating && (
        <div className="pdf-offscreen" ref={pdfRootRef}>
          {pdfPages.map((page, i) => (
            <div key={`pdf-page-${i}`} className="pdf-page" data-pdf-page="1">
              <div className="pdf-grid">
                {page.map((it) => (
                  <div key={it.child.id}>
                    <CreditStyleCard childName={it.child.name} token={it.card.token} walletUrl={it.url} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Box>
  )
}
