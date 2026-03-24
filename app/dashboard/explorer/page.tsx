import { Header } from '@/components/dashboard/header'
import { DatabaseExplorer } from '@/components/dashboard/database-explorer'

export default function ExplorerPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Database Explorer"
        description="Browse databases, tables, and schemas across all data engines"
      />
      <div className="flex-1 overflow-auto p-6">
        <DatabaseExplorer />
      </div>
    </div>
  )
}
