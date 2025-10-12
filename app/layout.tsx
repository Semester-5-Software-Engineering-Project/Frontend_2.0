import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { StudentProfileProvider } from '@/contexts/StudentProfileContex'
import { TutorProfileProvider } from '@/contexts/TutorProfileContex'
import { Toaster } from 'sonner'
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TutorVerse - Online Tutoring Platform',
  description: 'Connect with expert tutors for personalized online learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StudentProfileProvider>
            <TutorProfileProvider>
              {children}
              <Toaster position="top-right" />
              <ShadcnToaster />
            </TutorProfileProvider>
          </StudentProfileProvider>
        </AuthProvider>
      </body>
    </html>
  )
}