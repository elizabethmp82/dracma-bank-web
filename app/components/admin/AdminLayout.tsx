'use client'

import * as React from 'react'
import {
  Box,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material'

import TabsCriancas from './TabsCriancas';
import TabsLancamentos from './TabsLancamentos';
import TabsCartoes from './TabsCartoes';

export default function AdminLayout() {
  const [tab, setTab] = React.useState(0)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      
      {/* Topbar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Dracma Bank • Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        centered
        sx={{ bgcolor: '#fff' }}
      >
        <Tab label="Crianças" />
        <Tab label="Lançamentos" />
        <Tab label="Cartões" />
      </Tabs>

      {/* Conteúdo */}
      <Box sx={{ p: 2 }}>
        {tab === 0 && <TabsCriancas />}
        {tab === 1 && <TabsLancamentos />}
        {tab === 2 && <TabsCartoes />}
      </Box>
    </Box>
  )
}
