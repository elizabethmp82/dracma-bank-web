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
} from '@mui/material'

import { listChildren, type Child } from '@/app/lib/childrenApi'
import { createLedgerEntry } from '@/app/lib/ledgerApi'

export default function TabsLancamentos() {
  const [children, setChildren] = React.useState<Child[]>([])
  const [childId, setChildId] = React.useState('')
  const [type, setType] = React.useState<'CREDIT' | 'DEBIT'>('CREDIT')
  const [amount, setAmount] = React.useState<number>(5)
  const [reason, setReason] = React.useState('')

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        const list = await listChildren('')
        setChildren(list)
        if (list[0]?.id) setChildId(list[0].id)
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar crianças')
      }
    })()
  }, [])

  async function handleSubmit() {
    setError(null)
    setSuccess(null)

    if (!childId) return setError('Selecione uma criança')
    if (!reason.trim()) return setError('Informe o motivo')
    if (!Number.isInteger(amount) || amount <= 0) return setError('Valor inválido')

    setSaving(true)
    try {
      await createLedgerEntry({
        childId,
        type,
        amount,
        reason: reason.trim(),
      })
      setSuccess('Lançamento realizado com sucesso!')
      setReason('')
    } catch (e: any) {
      setError(e?.message || 'Erro ao lançar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Lançamentos</Typography>
        <Typography variant="body2" color="text.secondary">
          Adicione ou retire Dracmas com motivo (auditável).
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            select
            label="Criança"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            fullWidth
          >
            {children.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Tipo"
            value={type}
            onChange={(e) => setType(e.target.value as 'CREDIT' | 'DEBIT')}
            fullWidth
          >
            <MenuItem value="CREDIT">Entrada (+)</MenuItem>
            <MenuItem value="DEBIT">Saída (-)</MenuItem>
          </TextField>

          <TextField
            type="number"
            label="Quantidade de Dracmas"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1, step: 1 }}
          />

          <TextField
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Presença no culto"
            fullWidth
          />

          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando...' : 'Lançar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
