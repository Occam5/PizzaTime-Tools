import './globals.css'
import { Inter } from 'next/font/google'
import TopNavbar from '@/components/TopNavbar'
import Sidebar from '@/components/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/components/LanguageProvider'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

const WalletContextProvider = dynamic(
  () => import('@/components/WalletProvider').then(mod => mod.WalletContextProvider),
  { ssr: false }
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WalletContextProvider>
            <LanguageProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <TopNavbar />
                  <main className="flex-1 overflow-auto p-6 bg-background text-foreground">
                    {children}
                  </main>
                </div>
              </div>
            </LanguageProvider>
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}