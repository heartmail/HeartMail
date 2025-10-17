import ProtectedRoute from '@/components/auth/protected-route'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
