import { Header } from '@/components/dashboard/header'
import { ProceduresManager } from '@/components/dashboard/procedures-manager'

export default function ProceduresPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Procedures & Queries"
        description="Pre-built queries and stored procedures for common data tasks"
      />
      <div className="flex-1 overflow-auto p-6">
        <ProceduresManager />
      </div>
    </div>
  )
}
