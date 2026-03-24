import { Header } from '@/components/dashboard/header'
import { OutputManager } from '@/components/dashboard/output-manager'

export default function OutputsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Output Manager"
        description="Configure email, folder, and display destinations for your query results"
      />
      <div className="flex-1 overflow-auto p-6">
        <OutputManager />
      </div>
    </div>
  )
}
