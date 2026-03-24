import { Header } from '@/components/dashboard/header'
import { SettingsPanel } from '@/components/dashboard/settings-panel'

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        description="Manage your account, preferences, and data source connections"
      />
      <div className="flex-1 overflow-auto p-6">
        <SettingsPanel />
      </div>
    </div>
  )
}
