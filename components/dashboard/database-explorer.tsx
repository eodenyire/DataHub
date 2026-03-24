'use client'

import { useState, useMemo } from 'react'
import {
  Database,
  Table2,
  ChevronRight,
  ChevronDown,
  Search,
  Download,
  Play,
  Eye,
  Key,
  Link as LinkIcon,
} from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EngineBadge } from './engine-badge'
import { mockDataSources, mockDatabases, mockTables, executeMockQuery } from '@/lib/mock-data'
import type { DataSource, Database as DatabaseType, TableMetadata, QueryResult } from '@/lib/types'
import { cn } from '@/lib/utils'

export function DatabaseExplorer() {
  const [selectedEngine, setSelectedEngine] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set())
  const [selectedTable, setSelectedTable] = useState<TableMetadata | null>(null)
  const [previewData, setPreviewData] = useState<QueryResult | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Filter data sources by selected engine
  const filteredDataSources = useMemo(() => {
    if (selectedEngine === 'all') return mockDataSources
    return mockDataSources.filter((ds) => ds.engine === selectedEngine)
  }, [selectedEngine])

  // Get databases for filtered data sources
  const getDatabasesForSource = (sourceId: string) => {
    return mockDatabases.filter(
      (db) =>
        db.data_source_id === sourceId &&
        (searchQuery === '' ||
          db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          db.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  // Get tables for a database
  const getTablesForDatabase = (dbId: string) => {
    return mockTables.filter(
      (table) =>
        table.database_id === dbId &&
        (searchQuery === '' ||
          table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          table.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  const toggleDatabase = (dbId: string) => {
    setExpandedDatabases((prev) => {
      const next = new Set(prev)
      if (next.has(dbId)) {
        next.delete(dbId)
      } else {
        next.add(dbId)
      }
      return next
    })
  }

  const handleSelectTable = (table: TableMetadata) => {
    setSelectedTable(table)
    setPreviewData(null)
  }

  const handlePreviewData = async () => {
    if (!selectedTable) return
    setIsLoadingPreview(true)

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 800))

    const result = executeMockQuery(`SELECT * FROM ${selectedTable.name} LIMIT 10`)
    setPreviewData(result)
    setIsLoadingPreview(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-12rem)]">
      {/* Left Panel - Database Tree */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Sources</CardTitle>
          <CardDescription>Browse connected databases</CardDescription>

          <div className="flex gap-2 mt-2">
            <Select value={selectedEngine} onValueChange={setSelectedEngine}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All engines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Engines</SelectItem>
                <SelectItem value="druid">Druid</SelectItem>
                <SelectItem value="hive">Hive</SelectItem>
                <SelectItem value="drill">Drill</SelectItem>
                <SelectItem value="flink">Flink</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-2">
              {filteredDataSources.map((source) => (
                <DataSourceTree
                  key={source.id}
                  source={source}
                  databases={getDatabasesForSource(source.id)}
                  getTablesForDatabase={getTablesForDatabase}
                  expandedDatabases={expandedDatabases}
                  toggleDatabase={toggleDatabase}
                  selectedTable={selectedTable}
                  onSelectTable={handleSelectTable}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Table Details */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedTable ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Table2 className="h-5 w-5" />
                    {selectedTable.name}
                  </CardTitle>
                  <CardDescription>{selectedTable.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviewData}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Query
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Table Stats */}
              <div className="flex gap-4 mt-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Rows:</span>{' '}
                  <span className="font-medium">
                    {selectedTable.row_count?.toLocaleString() || 'Unknown'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Columns:</span>{' '}
                  <span className="font-medium">
                    {selectedTable.schema_definition.length}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>{' '}
                  <span className="font-medium">
                    {selectedTable.last_updated
                      ? new Date(selectedTable.last_updated).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto">
              {/* Schema View */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Schema</h4>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Column</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nullable</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTable.schema_definition.map((col, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {col.isPrimaryKey && (
                              <Key className="h-4 w-4 text-primary" title="Primary Key" />
                            )}
                            {col.isForeignKey && (
                              <LinkIcon className="h-4 w-4 text-accent" title="Foreign Key" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{col.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {col.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {col.nullable ? (
                              <span className="text-muted-foreground">Yes</span>
                            ) : (
                              <span className="font-medium">No</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {col.description || '-'}
                            {col.references && (
                              <span className="text-xs text-accent ml-2">
                                → {col.references.table}.{col.references.column}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Data Preview */}
              {(previewData || isLoadingPreview) && (
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Data Preview
                    {previewData && (
                      <span className="text-muted-foreground font-normal ml-2">
                        ({previewData.row_count} rows in {previewData.execution_time_ms}ms)
                      </span>
                    )}
                  </h4>

                  {isLoadingPreview ? (
                    <div className="rounded-md border p-8 text-center text-muted-foreground">
                      Loading preview data...
                    </div>
                  ) : previewData && previewData.rows.length > 0 ? (
                    <div className="rounded-md border overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {previewData.columns.map((col) => (
                              <TableHead key={col} className="whitespace-nowrap">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.rows.map((row, i) => (
                            <TableRow key={i}>
                              {previewData.columns.map((col) => (
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
                  ) : (
                    <div className="rounded-md border p-8 text-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Table2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Select a table</h3>
              <p className="text-muted-foreground mt-2">
                Choose a table from the left panel to view its schema and data
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function DataSourceTree({
  source,
  databases,
  getTablesForDatabase,
  expandedDatabases,
  toggleDatabase,
  selectedTable,
  onSelectTable,
}: {
  source: DataSource
  databases: DatabaseType[]
  getTablesForDatabase: (dbId: string) => TableMetadata[]
  expandedDatabases: Set<string>
  toggleDatabase: (dbId: string) => void
  selectedTable: TableMetadata | null
  onSelectTable: (table: TableMetadata) => void
}) {
  return (
    <div className="rounded-lg border bg-card">
      {/* Data Source Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm flex-1">{source.name}</span>
        <EngineBadge engine={source.engine} size="sm" />
      </div>

      {/* Databases */}
      <div className="p-2">
        {databases.length > 0 ? (
          databases.map((db) => {
            const tables = getTablesForDatabase(db.id)
            const isExpanded = expandedDatabases.has(db.id)

            return (
              <div key={db.id}>
                <button
                  onClick={() => toggleDatabase(db.id)}
                  className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted/50 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{db.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {tables.length}
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="ml-6 pl-2 border-l">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => onSelectTable(table)}
                        className={cn(
                          'flex items-center gap-2 w-full p-2 rounded text-left text-sm',
                          selectedTable?.id === table.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <Table2 className="h-4 w-4" />
                        <span className="truncate">{table.name}</span>
                      </button>
                    ))}
                    {tables.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">
                        No tables found
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground p-2">No databases found</p>
        )}
      </div>
    </div>
  )
}
