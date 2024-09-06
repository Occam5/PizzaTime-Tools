'use client'

import React from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import '@/app/globals.css'

export default function TopNavbar() {
  const { wallet, connect, connecting, connected } = useWallet()
  const { theme } = useTheme()

  return (
    <nav className={cn(
      "bg-background text-foreground border-b transition-colors duration-300",
      theme === 'dark' 
        ? 'bg-blue-300 bg-opacity-10 border-gray-700' 
        : 'bg-pizzapurple border-gray-200'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="relative">
                <Link href="/">
                  <img src="/logo.png" alt="Pizza Time Logo" className="h-10 w-10"/>
                </Link>
              </div>
              <Link href="/" className="text-xl font-bold ml-2">
                Pizza Time
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <ThemeToggle />
            <WalletMultiButton className="bg-primary text-primary-foreground hover:bg-primary/90" />
          </div>
        </div>
      </div>
    </nav>
  )
}