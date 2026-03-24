'use client'

import { useState } from 'react'
import {
  Plus,
  Mail,
  FolderOutput,
  Monitor,
  Webhook,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  XCircle,
  Settings2,
  FileSpreadsheet,
  FileJson,
  FileText,
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StatusBadge } from './status-badge'
import type { OutputDestination, OutputType } from '@/lib/types'

// Mock output destinations
const mockDestinations: OutputDestination[] = [
  {
    id: 'out-1',
    name: 'Finance Team Email',
    output_type: 'email',
    config: {
      email_addresses: ['finance@company.co.ke', 'reports@company.co.ke'],
      email_subject: 'Daily Transaction Report',
    },
    user_id: 'user-1',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'out-2',
    name: 'Reports Folder',
    output_type: 'folder',
    config: {
      folder_path: '/reports/transactions/',
      file_format: 'csv',
    },
    user_id: 'user-1',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'out-3',
    name: 'Compliance Webhook',
    output_type: 'api',
    config: {
      endpoint_url: 'https://compliance.internal/api/reports',
      headers: { 'Authorization': 'Bearer ***' },
    },
    user_id: 'user-1',
    is_active: false,
    created_at: '2024-01-15T10:00:00Z',
  },
]

// Mock recent exports
const mockExports = [
  {
    id: 'exp-1',
    name: 'Daily Transaction Summary',
    destination: 'Finance Team Email',
    type: 'email' as OutputType,
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'exp-2',
    name: 'High Value Transactions',
    destination: 'Reports Folder',
    type: 'folder' as OutputType,
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'exp-3',
    name: 'Compliance Report',
    destination: 'Compliance Webhook',
    type: 'api' as OutputType,
    status: 'failed' as const,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
]

const outputTypeIcons: Record<OutputType, typeof Mail> = {
  email: Mail,
  folder: FolderOutput,
  display: Monitor,
  api: Webhook,
}

const outputTypeLabels: Record<OutputType, string> = {
  email: 'Email',
  folder: 'Folder',
  display: 'Display',
  api: 'API/Webhook',
}

export function OutputManager() {
  const [destinations, setDestinations] = useState(mockDestinations)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState<OutputDestination | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<OutputType>('email')
  const [formEmails, setFormEmails] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formFolderPath, setFormFolderPath] = useState('')
  const [formFileFormat, setFormFileFormat] = useState('csv')
  const [formApiUrl, setFormApiUrl] = useState('')

  const resetForm = () => {
    setFormName('')
    setFormType('email')
    setFormEmails('')
    setFormSubject('')
    setFormFolderPath('')
    setFormFileFormat('csv')
    setFormApiUrl('')
    setEditingDestination(null)
  }

  const handleSave = () => {
    const newDestination: OutputDestination = {
      id: editingDestination?.id || `out-${Date.now()}`,
      name: formName,
      output_type: formType,
      config: {
        ...(formType === 'email' && {
          email_addresses: formEmails.split(',').map((e) => e.trim()),
          email_subject: formSubject,
        }),
        ...(formType === 'folder' && {
          folder_path: formFolderPath,
          file_format: formFileFormat as 'csv' | 'excel' | 'json',
        }),
        ...(formType === 'api' && {
          endpoint_url: formApiUrl,
        }),
      },
      user_id: 'user-1',
      is_active: true,
      created_at: editingDestination?.created_at || new Date().toISOString(),
    }

    if (editingDestination) {
      setDestinations(destinations.map((d) => (d.id === editingDestination.id ? newDestination : d)))
    } else {
      setDestinations([...destinations, newDestination])
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (destination: OutputDestination) => {
    setEditingDestination(destination)
    setFormName(destination.name)
    setFormType(destination.output_type)
    if (destination.output_type === 'email') {
      setFormEmails(destination.config.email_addresses?.join(', ') || '')
      setFormSubject(destination.config.email_subject || '')
    } else if (destination.output_type === 'folder') {
      setFormFolderPath(destination.config.folder_path || '')
      setFormFileFormat(destination.config.file_format || 'csv')
    } else if (destination.output_type === 'api') {
      setFormApiUrl(destination.config.endpoint_url || '')
    }
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDestinations(destinations.filter((d) => d.id !== id))
  }

  const toggleActive = (id: string) => {
    setDestinations(
      destinations.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d))
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Destinations
            </CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{destinations.length}</div>
            <p className="text-xs text-muted-foreground">
              {destinations.filter((d) => d.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email Outputs
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {destinations.filter((d) => d.output_type === 'email').length}
            </div>
            <p className="text-xs text-muted-foreground">Configured recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Folder Outputs
            </CardTitle>
            <FolderOutput className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {destinations.filter((d) => d.output_type === 'folder').length}
            </div>
            <p className="text-xs text-muted-foreground">Export locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Exports
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockExports.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="destinations">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="destinations">Output Destinations</TabsTrigger>
            <TabsTrigger value="history">Export History</TabsTrigger>
          </TabsList>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDestination ? 'Edit Destination' : 'Add Output Destination'}
                </DialogTitle>
                <DialogDescription>
                  Configure where to send your query results
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Finance Team Email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Output Type</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as OutputType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="folder">
                        <div className="flex items-center gap-2">
                          <FolderOutput className="h-4 w-4" />
                          Folder
                        </div>
                      </SelectItem>
                      <SelectItem value="api">
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4" />
                          API/Webhook
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Config */}
                {formType === 'email' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="emails">Email Addresses</Label>
                      <Input
                        id="emails"
                        value={formEmails}
                        onChange={(e) => setFormEmails(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple emails with commas
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        placeholder="Query Results - {date}"
                      />
                    </div>
                  </>
                )}

                {/* Folder Config */}
                {formType === 'folder' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="folder">Folder Path</Label>
                      <Input
                        id="folder"
                        value={formFolderPath}
                        onChange={(e) => setFormFolderPath(e.target.value)}
                        placeholder="/reports/exports/"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>File Format</Label>
                      <Select value={formFileFormat} onValueChange={setFormFileFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              CSV
                            </div>
                          </SelectItem>
                          <SelectItem value="excel">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4" />
                              Excel (.xlsx)
                            </div>
                          </SelectItem>
                          <SelectItem value="json">
                            <div className="flex items-center gap-2">
                              <FileJson className="h-4 w-4" />
                              JSON
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* API Config */}
                {formType === 'api' && (
                  <div className="space-y-2">
                    <Label htmlFor="apiUrl">Endpoint URL</Label>
                    <Input
                      id="apiUrl"
                      value={formApiUrl}
                      onChange={(e) => setFormApiUrl(e.target.value)}
                      placeholder="https://api.example.com/webhook"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formName}>
                  {editingDestination ? 'Save Changes' : 'Add Destination'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Destinations Tab */}
        <TabsContent value="destinations" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => {
              const Icon = outputTypeIcons[destination.output_type]

              return (
                <Card key={destination.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{destination.name}</CardTitle>
                          <CardDescription>
                            {outputTypeLabels[destination.output_type]}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={destination.is_active}
                        onCheckedChange={() => toggleActive(destination.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {destination.output_type === 'email' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Recipients</span>
                            <span className="font-medium">
                              {destination.config.email_addresses?.length || 0}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {destination.config.email_addresses?.join(', ')}
                          </div>
                        </>
                      )}
                      {destination.output_type === 'folder' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Path</span>
                            <span className="font-mono text-xs">
                              {destination.config.folder_path}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Format</span>
                            <Badge variant="secondary">
                              {destination.config.file_format?.toUpperCase()}
                            </Badge>
                          </div>
                        </>
                      )}
                      {destination.output_type === 'api' && (
                        <div className="text-xs text-muted-foreground truncate">
                          {destination.config.endpoint_url}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(destination)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(destination.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {destinations.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderOutput className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No output destinations</h3>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    Add output destinations to send your query results to email, folders, or
                    external APIs
                  </p>
                  <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Destination
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>History of your query result exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExports.map((exp) => {
                  const Icon = outputTypeIcons[exp.type]

                  return (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{exp.name}</p>
                          <p className="text-sm text-muted-foreground">
                            To: {exp.destination}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={exp.status} />
                        <span className="text-sm text-muted-foreground">
                          {exp.timestamp.toLocaleDateString()} at{' '}
                          {exp.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
