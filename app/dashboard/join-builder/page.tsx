import { Header } from '@/components/dashboard/header'
import { JoinBuilder } from '@/components/dashboard/join-builder'

export default function JoinBuilderPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Visual Join Builder"
        description="Build complex queries by visually selecting tables and join conditions"
      />
      <div className="flex-1 overflow-auto p-6">
        <JoinBuilder />
      </div>
    </div>
  )
}
