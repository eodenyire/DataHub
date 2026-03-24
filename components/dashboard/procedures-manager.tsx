'use client'

import { useState } from 'react'
import {
  Play,
  Code,
  Download,
  Mail,
  Search,
  FileCode,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockProcedures, executeMockQuery } from '@/lib/mock-data'
import type { Procedure, QueryResult } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ExecutionHistory {
  id: string
  procedureName: string
  parameters: Record<string, string>
  status: 'completed' | 'failed'
  rowCount: number
  executionTime: number
  timestamp: Date
}

export function ProceduresManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([])

  // Get unique categories
  const categories = Array.from(
    new Set(mockProcedures.map((p) => p.category).filter(Boolean))
  ) as string[]

  // Filter procedures
  const filteredProcedures = mockProcedures.filter((proc) => {
    const matchesSearch =
      searchQuery === '' ||
      proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || proc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectProcedure = (procedure: Procedure) => {
    setSelectedProcedure(procedure)
    setQueryResult(null)
    // Initialize parameters with defaults
    const defaults: Record<string, string> = {}
    procedure.parameters.forEach((param) => {
      if (param.default_value) {
        defaults[param.name] = param.default_value
      } else if (param.type === 'date') {
        defaults[param.name] = new Date().toISOString().split('T')[0]
      } else {
        defaults[param.name] = ''
      }
    })
    setParameters(defaults)
  }

  const handleExecute = async () => {
    if (!selectedProcedure) return

    setIsExecuting(true)

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = executeMockQuery(selectedProcedure.sql_query, parameters)
    setQueryResult(result)

    // Add to history
    const historyEntry: ExecutionHistory = {
      id: `exec-${Date.now()}`,
      procedureName: selectedProcedure.name,
      parameters: { ...parameters },
      status: 'completed',
      rowCount: result.row_count,
      executionTime: result.execution_time_ms,
      timestamp: new Date(),
    }
    setExecutionHistory([historyEntry, ...executionHistory])

    setIsExecuting(false)
  }

  const exportToCSV = () => {
    if (!queryResult) return

    const csv = [
      queryResult.columns.join(','),
      ...queryResult.rows.map((row) =>
        queryResult.columns.map((col) => String(row[col] ?? '')).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedProcedure?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-12rem)]">
      {/* Left Panel - Procedure List */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Available Procedures</CardTitle>
          <CardDescription>Select a procedure to execute</CardDescription>

          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-2">
              {filteredProcedures.map((proc) => (
                <button
                  key={proc.id}
                  onClick={() => handleSelectProcedure(proc)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-colors',
                    selectedProcedure?.id === proc.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <FileCode className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{proc.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {proc.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {proc.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {proc.parameters.length} params
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {filteredProcedures.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No procedures found
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Execution */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedProcedure ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProcedure.name}</CardTitle>
                  <CardDescription>{selectedProcedure.description}</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Code className="h-4 w-4 mr-2" />
                      View SQL
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>SQL Query</DialogTitle>
                      <DialogDescription>
                        The underlying SQL for this procedure
                      </DialogDescription>
                    </DialogHeader>
                    <pre className="rounded-lg bg-muted p-4 font-mono text-sm overflow-auto max-h-96">
                      {selectedProcedure.sql_query}
                    </pre>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs defaultValue="execute" className="h-full flex flex-col">
                <TabsList className="mx-4">
                  <TabsTrigger value="execute">Execute</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  {/* Execute Tab */}
                  <TabsContent value="execute" className="h-full m-0 p-4">
                    <div className="space-y-6">
                      {/* Parameters */}
                      {selectedProcedure.parameters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3">Parameters</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            {selectedProcedure.parameters.map((param) => (
                              <div key={param.name} className="space-y-2">
                                <Label htmlFor={param.name}>
                                  {param.label}
                                  {param.required && (
                                    <span className="text-destructive ml-1">*</span>
                                  )}
                                </Label>
                                {param.type === 'select' && param.options ? (
                                  <Select
                                    value={parameters[param.name] || ''}
                                    onValueChange={(v) =>
                                      setParameters({ ...parameters, [param.name]: v })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {param.options.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    id={param.name}
                                    type={
                                      param.type === 'date'
                                        ? 'date'
                                        : param.type === 'number'
                                          ? 'number'
                                          : 'text'
                                    }
                                    value={parameters[param.name] || ''}
                                    onChange={(e) =>
                                      setParameters({
                                        ...parameters,
                                        [param.name]: e.target.value,
                                      })
                                    }
                                    placeholder={param.default_value || ''}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Execute Button */}
                      <div className="flex gap-2">
                        <Button onClick={handleExecute} disabled={isExecuting}>
                          <Play className="h-4 w-4 mr-2" />
                          {isExecuting ? 'Executing...' : 'Execute'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Results Tab */}
                  <TabsContent value="results" className="h-full m-0 p-4 overflow-auto">
                    {isExecuting ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="mt-4 text-muted-foreground">Executing query...</p>
                        </div>
                      </div>
                    ) : queryResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm">
                            <span>
                              <span className="text-muted-foreground">Rows:</span>{' '}
                              <span className="font-medium">{queryResult.row_count}</span>
                            </span>
                            <span>
                              <span className="text-muted-foreground">Time:</span>{' '}
                              <span className="font-medium">
                                {queryResult.execution_time_ms}ms
                              </span>
                            </span>
                          </div>
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
                        </div>

                        <div className="rounded-md border overflow-auto max-h-[400px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {queryResult.columns.map((col) => (
                                  <TableHead key={col} className="whitespace-nowrap">
                                    {col}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {queryResult.rows.map((row, i) => (
                                <TableRow key={i}>
                                  {queryResult.columns.map((col) => (
                                    <TableCell
                                      key={col}
                                      className="font-mono text-xs whitespace-nowrap"
                                    >
                                      {String(row[col] ?? '-')}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Play className="h-12 w-12 mx-auto text-muted-foreground/50" />
                          <h3 className="mt-4 text-lg font-medium">No results yet</h3>
                          <p className="text-muted-foreground mt-2">
                            Configure parameters and click &ldquo;Execute&rdquo; to run the
                            procedure
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history" className="h-full m-0 p-4 overflow-auto">
                    {executionHistory.length > 0 ? (
                      <div className="space-y-2">
                        {executionHistory.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              {entry.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-success" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{entry.procedureName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.rowCount} rows in {entry.executionTime}ms
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {entry.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
                          <h3 className="mt-4 text-lg font-medium">No execution history</h3>
                          <p className="text-muted-foreground mt-2">
                            Run some queries to see your history here
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileCode className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Select a procedure</h3>
              <p className="text-muted-foreground mt-2">
                Choose a procedure from the left panel to configure and execute
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
