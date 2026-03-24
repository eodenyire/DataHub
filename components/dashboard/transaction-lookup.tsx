'use client'

import { useState } from 'react'
import { Search, Download, Mail, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EngineBadge } from './engine-badge'
import { StatusBadge } from './status-badge'
import { mockTransactions } from '@/lib/mock-data'
import type { Transaction } from '@/lib/types'

export function TransactionLookup() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Transaction[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Search mock data
    const query = searchQuery.toLowerCase()
    const results = mockTransactions.filter(
      (txn) =>
        txn.transaction_id.toLowerCase().includes(query) ||
        txn.sender_phone.includes(query) ||
        txn.receiver_phone.includes(query) ||
        txn.sender_name.toLowerCase().includes(query) ||
        txn.receiver_name.toLowerCase().includes(query) ||
        txn.reference?.toLowerCase().includes(query)
    )

    setSearchResults(results)
    setIsSearching(false)
  }

  const exportToCSV = () => {
    const headers = [
      'Transaction ID',
      'Amount',
      'Currency',
      'Sender',
      'Receiver',
      'Type',
      'Status',
      'Date',
    ]
    const rows = searchResults.map((txn) => [
      txn.transaction_id,
      txn.amount,
      txn.currency,
      `${txn.sender_name} (${txn.sender_phone})`,
      `${txn.receiver_name} (${txn.receiver_phone})`,
      txn.transaction_type,
      txn.status,
      new Date(txn.created_at).toLocaleString(),
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>
            Search by Transaction ID, phone number, customer name, or reference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter transaction ID, phone number, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {/* Quick Search Examples */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {['TXN', '254712', 'Kamau', 'REF'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setSearchQuery(example)}
                className="text-sm text-primary hover:underline"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {searchResults.length > 0
                  ? `Found ${searchResults.length} transaction${searchResults.length !== 1 ? 's' : ''}`
                  : 'No results found'}
              </CardTitle>
              {searchResults.length > 0 && (
                <CardDescription>
                  Results from all connected data engines
                </CardDescription>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.slice(0, 20).map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-sm">
                          {txn.transaction_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {txn.currency} {txn.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.sender_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {txn.sender_phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.receiver_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {txn.receiver_phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {txn.transaction_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={txn.status} />
                        </TableCell>
                        <TableCell>
                          <EngineBadge engine={txn.source_engine} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedTransaction(txn)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                  Full transaction information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedTransaction && (
                                <TransactionDetails transaction={selectedTransaction} />
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No transactions found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">
                  Try searching with a different term
                </p>
              </div>
            )}

            {searchResults.length > 20 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Showing 20 of {searchResults.length} results
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!hasSearched && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Search for transactions</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Enter a transaction ID, phone number, customer name, or reference to
                find transactions across all connected data engines.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TransactionDetails({ transaction }: { transaction: Transaction }) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={transaction.status} size="md" />
          <EngineBadge engine={transaction.source_engine} size="md" />
        </div>
        <span className="text-2xl font-bold">
          {transaction.currency} {transaction.amount.toLocaleString()}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard title="Transaction ID">
          <span className="font-mono">{transaction.transaction_id}</span>
        </DetailCard>

        <DetailCard title="Reference">
          {transaction.reference || 'N/A'}
        </DetailCard>

        <DetailCard title="Sender">
          <p className="font-medium">{transaction.sender_name}</p>
          <p className="text-sm text-muted-foreground">{transaction.sender_phone}</p>
        </DetailCard>

        <DetailCard title="Receiver">
          <p className="font-medium">{transaction.receiver_name}</p>
          <p className="text-sm text-muted-foreground">{transaction.receiver_phone}</p>
        </DetailCard>

        <DetailCard title="Transaction Type">
          <span className="capitalize">
            {transaction.transaction_type.replace('_', ' ')}
          </span>
        </DetailCard>

        <DetailCard title="Fee">
          {transaction.currency} {transaction.fee.toLocaleString()}
        </DetailCard>

        <DetailCard title="Created">
          {new Date(transaction.created_at).toLocaleString('en-KE', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </DetailCard>

        <DetailCard title="Completed">
          {transaction.completed_at
            ? new Date(transaction.completed_at).toLocaleString('en-KE', {
                dateStyle: 'full',
                timeStyle: 'short',
              })
            : 'Pending'}
        </DetailCard>
      </div>

      {/* Description */}
      {transaction.description && (
        <DetailCard title="Description">
          {transaction.description}
        </DetailCard>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Email Details
        </Button>
      </div>
    </div>
  )
}

function DetailCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}
