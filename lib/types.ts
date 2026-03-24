// User and Role types
export type UserRole = 'admin' | 'engineer' | 'analyst' | 'viewer'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization?: string
  created_at: string
  updated_at: string
}

// Data Engine types - Big Data Processing Engines
export type DataEngine = 'druid' | 'hive' | 'drill' | 'flink'

// Database types - Traditional and NoSQL Databases
export type DatabaseType = 
  | 'postgresql' 
  | 'mysql' 
  | 'mariadb' 
  | 'mssql' 
  | 'oracle' 
  | 'mongodb' 
  | 'neo4j' 
  | 'cassandra' 
  | 'sqlite'
  | 'cockroachdb'
  | 'clickhouse'
  | 'snowflake'
  | 'bigquery'
  | 'redshift'

// Combined engine/database type for data sources
export type DataSourceType = DataEngine | DatabaseType

export interface DataSource {
  id: string
  name: string
  engine: DataEngine
  connection_string?: string
  host?: string
  port?: number
  database_name?: string
  username?: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Database {
  id: string
  data_source_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface TableMetadata {
  id: string
  database_id: string
  name: string
  description?: string
  schema_definition: ColumnSchema[]
  row_count?: number
  last_updated?: string
  created_at: string
}

export interface ColumnSchema {
  name: string
  type: string
  nullable: boolean
  description?: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  references?: {
    table: string
    column: string
  }
}

// Procedure types
export interface Procedure {
  id: string
  name: string
  description?: string
  sql_query: string
  parameters: ProcedureParameter[]
  data_source_id?: string
  category?: string
  is_public: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ProcedureParameter {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'select'
  label: string
  required: boolean
  default_value?: string
  options?: string[] // for select type
}

// Query Execution types
export interface QueryExecution {
  id: string
  user_id: string
  procedure_id?: string
  query_text: string
  parameters?: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed'
  result_count?: number
  execution_time_ms?: number
  error_message?: string
  created_at: string
}

// Output types
export type OutputType = 'email' | 'folder' | 'display' | 'api'

export interface OutputDestination {
  id: string
  name: string
  output_type: OutputType
  config: OutputConfig
  user_id: string
  is_active: boolean
  created_at: string
}

export interface OutputConfig {
  // Email config
  email_addresses?: string[]
  email_subject?: string
  // Folder config
  folder_path?: string
  file_format?: 'csv' | 'excel' | 'json' | 'parquet'
  // API config
  endpoint_url?: string
  headers?: Record<string, string>
}

// Saved Query / Join Builder types
export interface SavedQuery {
  id: string
  name: string
  description?: string
  query_text: string
  join_config?: JoinConfig
  user_id: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface JoinConfig {
  tables: JoinTable[]
  joins: JoinDefinition[]
  selected_columns: SelectedColumn[]
  filters?: QueryFilter[]
  aggregations?: Aggregation[]
  order_by?: OrderByClause[]
  limit?: number
}

export interface JoinTable {
  id: string
  database_id: string
  table_name: string
  alias: string
}

export interface JoinDefinition {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  left_table: string
  left_column: string
  right_table: string
  right_column: string
}

export interface SelectedColumn {
  table_alias: string
  column_name: string
  alias?: string
}

export interface QueryFilter {
  table_alias: string
  column_name: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'BETWEEN' | 'IS NULL' | 'IS NOT NULL'
  value: unknown
  value_end?: unknown // for BETWEEN
}

export interface Aggregation {
  function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT DISTINCT'
  column: SelectedColumn
  alias: string
}

export interface OrderByClause {
  column: SelectedColumn
  direction: 'ASC' | 'DESC'
}

// Transaction type (for Kenyan financial context)
export interface Transaction {
  id: string
  transaction_id: string
  amount: number
  currency: string
  sender_name: string
  sender_phone: string
  receiver_name: string
  receiver_phone: string
  transaction_type: 'mpesa' | 'bank_transfer' | 'airtel_money' | 'equity_pay' | 'pesalink'
  status: 'completed' | 'pending' | 'failed' | 'reversed'
  reference?: string
  description?: string
  fee: number
  created_at: string
  completed_at?: string
  source_engine: DataEngine
}

// Query Result type
export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  row_count: number
  execution_time_ms: number
  source_engine: DataEngine
}
