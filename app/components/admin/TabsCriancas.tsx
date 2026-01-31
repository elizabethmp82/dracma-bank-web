'use client'

import * as React from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import VisibilityIcon from '@mui/icons-material/Visibility'

import Divider from '@mui/material/Divider'




import {
  listChildren,
  createChild,
  updateChild,
  deleteChild,
  type Child,
} from '@/app/lib/childrenApi'
import { getActiveCardByChild, issueCard } from '@/app/lib/cardsApi'
import { getChildSummary, type ChildSummary } from '@/app/lib/childrenSummaryApi'

export default function TabsCriancas() {
  const [rows, setRows] = React.useState<Child[]>([])
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // modal create / edit
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Child | null>(null)

  // confirm delete
  const [confirmDelete, setConfirmDelete] = React.useState<Child | null>(null)

  // form
  const [name, setName] = React.useState('')
  const [photoUrl, setPhotoUrl] = React.useState('')

const [openDetails, setOpenDetails] = React.useState(false)
const [detailsLoading, setDetailsLoading] = React.useState(false)
const [summary, setSummary] = React.useState<ChildSummary | null>(null)


  async function load(currentSearch?: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await listChildren(currentSearch)
      setRows(data)
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar crianças')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load('')
  }, [])

  function resetForm() {
    setName('')
    setPhotoUrl('')
  }

  function openCreate() {
    resetForm()
    setEditing(null)
    setOpen(true)
  }

  function openEdit(child: Child) {
    setEditing(child)
    setName(child.name)
    setPhotoUrl(child.photo_url || '')
    setOpen(true)
  }

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return

    setSaving(true)
    setError(null)

    try {
      if (editing) {
        await updateChild(editing.id, {
          name: trimmed,
          photo_url: photoUrl.trim() || '',
        })
      } else {
        await createChild({
          name: trimmed,
          photo_url: photoUrl.trim() || '',
        })
      }

      setOpen(false)
      setEditing(null)
      resetForm()
      await load(search)
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return

    setSaving(true)
    setError(null)

    try {
      await deleteChild(confirmDelete.id)
      setConfirmDelete(null)
      await load(search)
    } catch (e: any) {
      setError(e?.message || 'Erro ao excluir')
    } finally {
      setSaving(false)
    }
  }

  async function handleViewCard(childId: string) {
  setSaving(true)
  setError(null)
  try {
    let card = await getActiveCardByChild(childId)
    if (!card) {
      card = await issueCard(childId)
    }
    window.open(`/c/${card.token}`, '_blank')
  } catch (e: any) {
    setError(e?.message || 'Erro ao abrir cartão')
  } finally {
    setSaving(false)
  }
}

async function openDetailsDialog(child: Child) {
  setError(null)
  setDetailsLoading(true)
  setOpenDetails(true)
  setSummary(null)

  try {
    const data = await getChildSummary(child.id)
    setSummary(data)
  } catch (e: any) {
    setError(e?.message || 'Erro ao carregar detalhes')
  } finally {
    setDetailsLoading(false)
  }
}



  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Paper sx={{ p: 2 }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6">Crianças</Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastre, edite e gerencie as crianças do Dracma Bank.
            </Typography>
          </Box>

          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Cadastrar criança
          </Button>
        </Stack>

        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Search */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Buscar por nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load(search)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <Button onClick={() => load(search)} disabled={loading}>
                  Buscar
                </Button>
              ),
            }}
          />
        </Box>

        {/* Table */}
        <Box sx={{ mt: 2, overflowX: 'auto' }}>
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Foto</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma criança cadastrada.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Avatar src={c.photo_url || undefined}>
                          {c.name?.[0]?.toUpperCase()}
                        </Avatar>
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600 }}>
                        {c.name}
                      </TableCell>

                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {c.id}
                      </TableCell>

                      <TableCell align="right">

                       <IconButton aria-label="Ver cartão" onClick={() => handleViewCard(c.id)} title="Ver cartão">
                          <CreditCardIcon />
                       </IconButton>
                       <IconButton aria-label="Detalhes" title="Detalhes / Extrato" onClick={() => openDetailsDialog(c)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton onClick={() => openEdit(c)} title="Editar">
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => setConfirmDelete(c)}  title="Excluir"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* Modal Create / Edit */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? 'Editar criança' : 'Cadastrar criança'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Nome da criança"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="URL da foto (opcional)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving
              ? 'Salvando...'
              : editing
              ? 'Salvar alterações'
              : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Excluir criança</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja excluir{' '}
            <b>{confirmDelete?.name}</b>?
            <br />
            A criança será apenas desativada.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} fullWidth maxWidth="md">
  <DialogTitle>Detalhes / Extrato</DialogTitle>

  <DialogContent>
    {detailsLoading ? (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    ) : !summary ? (
      <Typography variant="body2" color="text.secondary">
        Nenhum dado para mostrar.
      </Typography>
    ) : (
      <Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={summary.child.photo_url || undefined}>
            {summary.child.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box>
            <Typography fontWeight={800}>{summary.child.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Saldo atual: <b>{summary.balance}</b> Dracmas
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={800} sx={{ mb: 1 }}>
          Movimentações (últimas 30)
        </Typography>

        {summary.entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma movimentação ainda.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.entries.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>
                    {new Date(e.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{e.reason}</TableCell>
                  <TableCell>{e.type === 'CREDIT' ? 'Entrada' : 'Saída'}</TableCell>
                  <TableCell align="right">
                    {e.type === 'CREDIT' ? '+' : '-'}{e.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    )}
  </DialogContent>
<DialogActions>
    <Button onClick={() => setOpenDetails(false)}>Fechar</Button>
  </DialogActions>
</Dialog>

    </Box>


  )
}
