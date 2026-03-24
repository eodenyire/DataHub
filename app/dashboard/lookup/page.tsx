import { Header } from '@/components/dashboard/header'
import { TransactionLookup } from '@/components/dashboard/transaction-lookup'

export default function LookupPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Transaction Lookup"
        description="Search and view transaction details across all data engines"
      />
      <div className="flex-1 overflow-auto p-6">
        <TransactionLookup />
      </div>
    </div>
  )
}
