import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'

// Force dynamic rendering to prevent AuthProvider issues during build
export const dynamic = 'force-dynamic'

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: 'HeartMail - Keeping hearts connected, one email at a time',
  description: 'Send heartfelt emails to your loved ones with HeartMail. Schedule, personalize, and stay connected with the people who matter most.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  // Performance optimizations
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://heartsmail.com',
    title: 'HeartMail - Keeping hearts connected',
    description: 'Send heartfelt emails to your loved ones with HeartMail.',
    siteName: 'HeartMail',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeartMail - Keeping hearts connected',
    description: 'Send heartfelt emails to your loved ones with HeartMail.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
              <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#E63365" />
                {/* Preload critical resources */}
                <link rel="preload" href="/background-home.jpg" as="image" />
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//images.unsplash.com" />
                {/* Critical CSS for above-the-fold content */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .hero-title { font-size: 3rem; line-height: 1.1; font-weight: 700; }
                    .hero-subtitle { font-size: 1.25rem; line-height: 1.6; margin-top: 1.5rem; }
                    .btn-heartmail { background: linear-gradient(135deg, #E63365, #F472B6); }
                    .floating-hearts { position: absolute; width: 100%; height: 100%; }
                    .floating-heart { position: absolute; font-size: 2rem; animation: float 6s ease-in-out infinite; }
                    @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(180deg); } }
                  `
                }} />
              </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}