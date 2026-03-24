import { Header } from '@/components/dashboard/header'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        description="Overview of your data platform activity"
      />
      <div className="flex-1 overflow-auto p-6">
        <DashboardOverview />
      </div>
    </div>
  )
}
