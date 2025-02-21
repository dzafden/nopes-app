import type React from "react"
import type { Metadata } from "next"
import { Inter, IBM_Plex_Sans } from "next/font/google"
import "./globals.css"
import { storage } from "@/lib/storage"

const inter = Inter({ subsets: ["latin"] })
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
})

export const metadata: Metadata = {
  title: "Nopes - Prioritize with Purpose",
  description: "A simple task prioritization app based on the Eisenhower Matrix",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get initial theme from storage
  const theme = storage.getTheme()

  return (
    <html lang="en" className={`${theme} ${ibmPlexSans.variable}`} style={{ colorScheme: theme }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased transition-colors duration-150">{children}</body>
    </html>
  )
}



import './globals.css'