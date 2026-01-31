import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Dracma Bank',
  description: 'Carteirinha digital e painel admin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
