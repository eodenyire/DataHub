'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { createClient } from '@/lib/supabase/client'

interface DashboardShellProps {
  children: React.ReactNode
  userEmail?: string
  userRole?: string
}

export function DashboardShell({ children, userEmail, userRole }: DashboardShellProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        userEmail={userEmail}
        userRole={userRole}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
