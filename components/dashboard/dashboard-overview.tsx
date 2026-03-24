'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EngineBadge } from './engine-badge'
import { StatusBadge } from './status-badge'
import { mockDataSources, mockTransactions, mockProcedures } from '@/lib/mock-data'
import {
  Database,
  Activity,
  FileCode,
  AlertTriangle,
  TrendingUp,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Calculate some stats
const totalTransactions = mockTransactions.length
const completedCount = mockTransactions.filter(t => t.status === 'completed').length
const failedCount = mockTransactions.filter(t => t.status === 'failed').length
const totalAmount = mockTransactions.reduce((sum, t) => sum + t.amount, 0)

const recentTransactions = mockTransactions.slice(0, 5)

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data Sources
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDataSources.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockDataSources.filter(ds => ds.is_active).length} active engines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volume
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {(totalAmount / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTransactions.toLocaleString()} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((completedCount / totalTransactions) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedCount} completed, {failedCount} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Procedures
            </CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProcedures.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockProcedures.filter(p => p.is_public).length} public queries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Engines Status */}
      <Card>
        <CardHeader>
          <CardTitle>Data Engines</CardTitle>
          <CardDescription>
            Connected data sources across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mockDataSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <EngineBadge engine={source.engine} size="md" />
                  </div>
                  <p className="text-sm text-muted-foreground">{source.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {source.host}:{source.port}
                  </p>
                </div>
                <StatusBadge status={source.is_active ? 'active' : 'inactive'} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest transaction activity</CardDescription>
            </div>
            <Link href="/dashboard/lookup">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{txn.transaction_id}</span>
                      <EngineBadge engine={txn.source_engine} size="sm" showIcon={false} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {txn.sender_name} → {txn.receiver_name}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">
                      KES {txn.amount.toLocaleString()}
                    </p>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/dashboard/lookup">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Transaction Lookup</p>
                      <p className="text-sm text-muted-foreground">
                        Search by transaction ID
                      </p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/explorer">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Browse Databases</p>
                      <p className="text-sm text-muted-foreground">
                        Explore tables and schemas
                      </p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/procedures">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileCode className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Run Procedure</p>
                      <p className="text-sm text-muted-foreground">
                        Execute pre-built queries
                      </p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/dashboard/join-builder">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                      <AlertTriangle className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Build Custom Query</p>
                      <p className="text-sm text-muted-foreground">
                        Visual join and filter builder
                      </p>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Query executions and system events</CardDescription>
          </div>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Query executed', detail: 'Daily Transaction Summary', time: '2 min ago', status: 'completed' as const },
              { action: 'Export completed', detail: 'Customer report → CSV', time: '15 min ago', status: 'completed' as const },
              { action: 'Query executed', detail: 'High Value Transactions', time: '32 min ago', status: 'completed' as const },
              { action: 'Procedure created', detail: 'New fraud detection query', time: '1 hr ago', status: 'completed' as const },
              { action: 'Query failed', detail: 'Connection timeout to Hive', time: '2 hr ago', status: 'failed' as const },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-success' : 'bg-destructive'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
