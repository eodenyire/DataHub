'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  X,
  Play,
  Save,
  Download,
  Code,
  Table2,
  GitMerge,
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
import { Checkbox } from '@/components/ui/checkbox'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { EngineBadge } from './engine-badge'
import { mockDataSources, mockDatabases, mockTables, executeMockQuery } from '@/lib/mock-data'
import type { TableMetadata, JoinConfig, JoinTable, JoinDefinition, SelectedColumn, QueryResult } from '@/lib/types'
import { cn } from '@/lib/utils'

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'

interface TableWithMeta extends JoinTable {
  tableMetadata: TableMetadata
  dataSourceName: string
  databaseName: string
}

export function JoinBuilder() {
  const [selectedTables, setSelectedTables] = useState<TableWithMeta[]>([])
  const [joins, setJoins] = useState<JoinDefinition[]>([])
  const [selectedColumns, setSelectedColumns] = useState<Map<string, Set<string>>>(new Map())
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [activeTab, setActiveTab] = useState('tables')

  // Generate SQL from current configuration
  const generatedSQL = useMemo(() => {
    if (selectedTables.length === 0) return ''

    const columns: string[] = []
    selectedColumns.forEach((cols, tableAlias) => {
      cols.forEach((col) => {
        columns.push(`${tableAlias}.${col}`)
      })
    })

    if (columns.length === 0) {
      // Select all columns if none selected
      selectedTables.forEach((table) => {
        columns.push(`${table.alias}.*`)
      })
    }

    let sql = `SELECT\n  ${columns.join(',\n  ')}\nFROM ${selectedTables[0].table_name} AS ${selectedTables[0].alias}`

    joins.forEach((join) => {
      const rightTable = selectedTables.find((t) => t.alias === join.right_table)
      if (rightTable) {
        sql += `\n${join.type} JOIN ${rightTable.table_name} AS ${rightTable.alias}`
        sql += `\n  ON ${join.left_table}.${join.left_column} = ${join.right_table}.${join.right_column}`
      }
    })

    return sql
  }, [selectedTables, joins, selectedColumns])

  const addTable = (tableId: string) => {
    const table = mockTables.find((t) => t.id === tableId)
    if (!table) return

    const database = mockDatabases.find((db) => db.id === table.database_id)
    const dataSource = mockDataSources.find((ds) => ds.id === database?.data_source_id)

    const alias = `t${selectedTables.length + 1}`

    const newTable: TableWithMeta = {
      id: table.id,
      database_id: table.database_id,
      table_name: table.name,
      alias,
      tableMetadata: table,
      dataSourceName: dataSource?.name || '',
      databaseName: database?.name || '',
    }

    setSelectedTables([...selectedTables, newTable])
  }

  const removeTable = (alias: string) => {
    setSelectedTables(selectedTables.filter((t) => t.alias !== alias))
    setJoins(joins.filter((j) => j.left_table !== alias && j.right_table !== alias))
    setSelectedColumns((prev) => {
      const next = new Map(prev)
      next.delete(alias)
      return next
    })
  }

  const addJoin = () => {
    if (selectedTables.length < 2) return

    const usedRightTables = new Set(joins.map((j) => j.right_table))
    const availableRightTables = selectedTables.filter(
      (t, i) => i > 0 && !usedRightTables.has(t.alias)
    )

    if (availableRightTables.length === 0) return

    const newJoin: JoinDefinition = {
      type: 'INNER',
      left_table: selectedTables[0].alias,
      left_column: selectedTables[0].tableMetadata.schema_definition[0]?.name || '',
      right_table: availableRightTables[0].alias,
      right_column: availableRightTables[0].tableMetadata.schema_definition[0]?.name || '',
    }

    setJoins([...joins, newJoin])
  }

  const updateJoin = (index: number, updates: Partial<JoinDefinition>) => {
    setJoins(joins.map((j, i) => (i === index ? { ...j, ...updates } : j)))
  }

  const removeJoin = (index: number) => {
    setJoins(joins.filter((_, i) => i !== index))
  }

  const toggleColumn = (tableAlias: string, columnName: string) => {
    setSelectedColumns((prev) => {
      const next = new Map(prev)
      const tableCols = next.get(tableAlias) || new Set()

      if (tableCols.has(columnName)) {
        tableCols.delete(columnName)
      } else {
        tableCols.add(columnName)
      }

      if (tableCols.size === 0) {
        next.delete(tableAlias)
      } else {
        next.set(tableAlias, tableCols)
      }

      return next
    })
  }

  const executeQuery = async () => {
    setIsExecuting(true)
    setActiveTab('results')

    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = executeMockQuery(generatedSQL)
    setQueryResult(result)
    setIsExecuting(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-12rem)]">
      {/* Left Panel - Table Selection */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Tables</CardTitle>
          <CardDescription>Select tables to include in your query</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4 pb-4">
            <div className="space-y-4">
              {mockDataSources.map((source) => {
                const databases = mockDatabases.filter(
                  (db) => db.data_source_id === source.id
                )

                return (
                  <div key={source.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <EngineBadge engine={source.engine} size="sm" />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>

                    {databases.map((db) => {
                      const tables = mockTables.filter((t) => t.database_id === db.id)

                      return (
                        <div key={db.id} className="ml-4 space-y-1">
                          <p className="text-xs text-muted-foreground">{db.name}</p>
                          {tables.map((table) => {
                            const isSelected = selectedTables.some(
                              (t) => t.id === table.id
                            )

                            return (
                              <button
                                key={table.id}
                                onClick={() => !isSelected && addTable(table.id)}
                                disabled={isSelected}
                                className={cn(
                                  'flex items-center gap-2 w-full p-2 rounded text-left text-sm',
                                  isSelected
                                    ? 'bg-primary/10 text-primary cursor-not-allowed'
                                    : 'hover:bg-muted/50'
                                )}
                              >
                                <Table2 className="h-4 w-4" />
                                <span className="truncate">{table.name}</span>
                                {isSelected && (
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    Added
                                  </Badge>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Query Builder */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Query Builder</CardTitle>
              <CardDescription>
                {selectedTables.length === 0
                  ? 'Add tables to start building your query'
                  : `${selectedTables.length} table${selectedTables.length !== 1 ? 's' : ''} selected`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={executeQuery}
                disabled={selectedTables.length === 0 || isExecuting}
              >
                <Play className="h-4 w-4 mr-2" />
                {isExecuting ? 'Running...' : 'Run Query'}
              </Button>
              <Button variant="outline" size="sm" disabled={selectedTables.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-4">
              <TabsTrigger value="tables">Tables & Columns</TabsTrigger>
              <TabsTrigger value="joins">Joins</TabsTrigger>
              <TabsTrigger value="sql">Generated SQL</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {/* Tables & Columns Tab */}
              <TabsContent value="tables" className="h-full m-0 p-4 overflow-auto">
                {selectedTables.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Table2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">No tables selected</h3>
                      <p className="text-muted-foreground mt-2">
                        Select tables from the left panel to start building your query
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedTables.map((table) => (
                      <Card key={table.alias}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm">{table.table_name}</CardTitle>
                              <CardDescription className="text-xs">
                                Alias: {table.alias} | {table.databaseName}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTable(table.alias)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-48 overflow-auto">
                            {table.tableMetadata.schema_definition.map((col) => {
                              const isSelected =
                                selectedColumns.get(table.alias)?.has(col.name) ?? false

                              return (
                                <label
                                  key={col.name}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      toggleColumn(table.alias, col.name)
                                    }
                                  />
                                  <span className="font-mono text-sm">{col.name}</span>
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {col.type}
                                  </Badge>
                                </label>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Joins Tab */}
              <TabsContent value="joins" className="h-full m-0 p-4 overflow-auto">
                {selectedTables.length < 2 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <GitMerge className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">Add more tables</h3>
                      <p className="text-muted-foreground mt-2">
                        You need at least 2 tables to create joins
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button variant="outline" onClick={addJoin}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Join
                    </Button>

                    {joins.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No joins configured. Click &ldquo;Add Join&rdquo; to connect tables.
                      </div>
                    )}

                    {joins.map((join, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Type:</Label>
                              <Select
                                value={join.type}
                                onValueChange={(v) =>
                                  updateJoin(index, { type: v as JoinType })
                                }
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INNER">INNER</SelectItem>
                                  <SelectItem value="LEFT">LEFT</SelectItem>
                                  <SelectItem value="RIGHT">RIGHT</SelectItem>
                                  <SelectItem value="FULL">FULL</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-2">
                              <Select
                                value={join.left_table}
                                onValueChange={(v) =>
                                  updateJoin(index, { left_table: v })
                                }
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedTables.map((t) => (
                                    <SelectItem key={t.alias} value={t.alias}>
                                      {t.alias}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span>.</span>
                              <Select
                                value={join.left_column}
                                onValueChange={(v) =>
                                  updateJoin(index, { left_column: v })
                                }
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedTables
                                    .find((t) => t.alias === join.left_table)
                                    ?.tableMetadata.schema_definition.map((col) => (
                                      <SelectItem key={col.name} value={col.name}>
                                        {col.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <span className="text-muted-foreground">=</span>

                            <div className="flex items-center gap-2">
                              <Select
                                value={join.right_table}
                                onValueChange={(v) =>
                                  updateJoin(index, { right_table: v })
                                }
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedTables
                                    .filter((t) => t.alias !== join.left_table)
                                    .map((t) => (
                                      <SelectItem key={t.alias} value={t.alias}>
                                        {t.alias}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <span>.</span>
                              <Select
                                value={join.right_column}
                                onValueChange={(v) =>
                                  updateJoin(index, { right_column: v })
                                }
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedTables
                                    .find((t) => t.alias === join.right_table)
                                    ?.tableMetadata.schema_definition.map((col) => (
                                      <SelectItem key={col.name} value={col.name}>
                                        {col.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto"
                              onClick={() => removeJoin(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* SQL Tab */}
              <TabsContent value="sql" className="h-full m-0 p-4">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Generated SQL</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(generatedSQL)}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <pre className="flex-1 overflow-auto rounded-lg bg-muted p-4 font-mono text-sm">
                    {generatedSQL || '-- Select tables to generate SQL'}
                  </pre>
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
                          <span className="font-medium">{queryResult.execution_time_ms}ms</span>
                        </span>
                        <EngineBadge engine={queryResult.source_engine} />
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    <div className="rounded-md border overflow-auto">
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
                        Build your query and click &ldquo;Run Query&rdquo; to see results
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
