'use client'

import * as React from 'react'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'

const theme = createTheme({
  // simples e default (depois ajustamos a identidade)
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
