import type {
  DataSource,
  Database,
  TableMetadata,
  Procedure,
  Transaction,
  QueryResult,
  DataEngine,
} from './types'

// Mock Data Sources (representing the 4 engines)
export const mockDataSources: DataSource[] = [
  {
    id: 'ds-1',
    name: 'Druid Analytics Cluster',
    engine: 'druid',
    host: 'druid-cluster.internal',
    port: 8082,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ds-2',
    name: 'Hive Data Warehouse',
    engine: 'hive',
    host: 'hive-master.internal',
    port: 10000,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ds-3',
    name: 'Apache Drill Federation',
    engine: 'drill',
    host: 'drill-cluster.internal',
    port: 8047,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ds-4',
    name: 'Flink Streaming Engine',
    engine: 'flink',
    host: 'flink-jobmanager.internal',
    port: 8081,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
]

// Mock Databases
export const mockDatabases: Database[] = [
  // Druid databases
  {
    id: 'db-1',
    data_source_id: 'ds-1',
    name: 'transactions_realtime',
    description: 'Real-time transaction data for analytics',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'db-2',
    data_source_id: 'ds-1',
    name: 'user_events',
    description: 'User activity events',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  // Hive databases
  {
    id: 'db-3',
    data_source_id: 'ds-2',
    name: 'core_banking',
    description: 'Core banking transaction history',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'db-4',
    data_source_id: 'ds-2',
    name: 'customer_data',
    description: 'Customer master data',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  // Drill databases
  {
    id: 'db-5',
    data_source_id: 'ds-3',
    name: 'external_partners',
    description: 'Partner API data federation',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'db-6',
    data_source_id: 'ds-3',
    name: 'regulatory_reports',
    description: 'CBK regulatory compliance data',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  // Flink databases
  {
    id: 'db-7',
    data_source_id: 'ds-4',
    name: 'fraud_detection',
    description: 'Real-time fraud detection streams',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'db-8',
    data_source_id: 'ds-4',
    name: 'notifications',
    description: 'Transaction notification streams',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
]

// Mock Tables
export const mockTables: TableMetadata[] = [
  // Druid transactions_realtime tables
  {
    id: 'tbl-1',
    database_id: 'db-1',
    name: 'mpesa_transactions',
    description: 'M-Pesa transaction records',
    schema_definition: [
      { name: 'transaction_id', type: 'VARCHAR', nullable: false, isPrimaryKey: true },
      { name: 'amount', type: 'DECIMAL(15,2)', nullable: false },
      { name: 'sender_phone', type: 'VARCHAR', nullable: false },
      { name: 'receiver_phone', type: 'VARCHAR', nullable: false },
      { name: 'transaction_type', type: 'VARCHAR', nullable: false },
      { name: 'status', type: 'VARCHAR', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'completed_at', type: 'TIMESTAMP', nullable: true },
    ],
    row_count: 15420000,
    last_updated: '2024-03-24T08:30:00Z',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'tbl-2',
    database_id: 'db-1',
    name: 'bank_transfers',
    description: 'Bank transfer records',
    schema_definition: [
      { name: 'transfer_id', type: 'VARCHAR', nullable: false, isPrimaryKey: true },
      { name: 'amount', type: 'DECIMAL(15,2)', nullable: false },
      { name: 'source_account', type: 'VARCHAR', nullable: false },
      { name: 'dest_account', type: 'VARCHAR', nullable: false },
      { name: 'bank_code', type: 'VARCHAR', nullable: false },
      { name: 'reference', type: 'VARCHAR', nullable: true },
      { name: 'status', type: 'VARCHAR', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
    ],
    row_count: 8750000,
    last_updated: '2024-03-24T08:30:00Z',
    created_at: '2024-01-15T10:00:00Z',
  },
  // Hive core_banking tables
  {
    id: 'tbl-3',
    database_id: 'db-3',
    name: 'transaction_history',
    description: 'Historical transaction archive',
    schema_definition: [
      { name: 'id', type: 'BIGINT', nullable: false, isPrimaryKey: true },
      { name: 'transaction_id', type: 'VARCHAR', nullable: false },
      { name: 'customer_id', type: 'VARCHAR', nullable: false, isForeignKey: true, references: { table: 'customers', column: 'id' } },
      { name: 'amount', type: 'DECIMAL(15,2)', nullable: false },
      { name: 'currency', type: 'VARCHAR', nullable: false },
      { name: 'transaction_date', type: 'DATE', nullable: false },
      { name: 'channel', type: 'VARCHAR', nullable: false },
      { name: 'branch_code', type: 'VARCHAR', nullable: true },
    ],
    row_count: 125000000,
    last_updated: '2024-03-23T23:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'tbl-4',
    database_id: 'db-4',
    name: 'customers',
    description: 'Customer master records',
    schema_definition: [
      { name: 'id', type: 'VARCHAR', nullable: false, isPrimaryKey: true },
      { name: 'full_name', type: 'VARCHAR', nullable: false },
      { name: 'phone_number', type: 'VARCHAR', nullable: false },
      { name: 'email', type: 'VARCHAR', nullable: true },
      { name: 'id_number', type: 'VARCHAR', nullable: false },
      { name: 'county', type: 'VARCHAR', nullable: true },
      { name: 'registration_date', type: 'DATE', nullable: false },
      { name: 'kyc_status', type: 'VARCHAR', nullable: false },
    ],
    row_count: 4500000,
    last_updated: '2024-03-24T06:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
  },
  // Drill external_partners tables
  {
    id: 'tbl-5',
    database_id: 'db-5',
    name: 'safaricom_settlements',
    description: 'Safaricom partner settlements',
    schema_definition: [
      { name: 'settlement_id', type: 'VARCHAR', nullable: false, isPrimaryKey: true },
      { name: 'partner_code', type: 'VARCHAR', nullable: false },
      { name: 'settlement_amount', type: 'DECIMAL(15,2)', nullable: false },
      { name: 'transaction_count', type: 'INT', nullable: false },
      { name: 'settlement_date', type: 'DATE', nullable: false },
      { name: 'status', type: 'VARCHAR', nullable: false },
    ],
    row_count: 365000,
    last_updated: '2024-03-24T00:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'tbl-6',
    database_id: 'db-6',
    name: 'cbk_daily_reports',
    description: 'Central Bank of Kenya daily reports',
    schema_definition: [
      { name: 'report_id', type: 'VARCHAR', nullable: false, isPrimaryKey: true },
      { name: 'report_date', type: 'DATE', nullable: false },
      { name: 'report_type', type: 'VARCHAR', nullable: false },
      { name: 'total_volume', type: 'DECIMAL(20,2)', nullable: false },
      { name: 'total_transactions', type: 'BIGINT', nullable: false },
      { name: 'submission_status', type: 'VARCHAR', nullable: false },
    ],
    row_count: 1825,
    last_updated: '2024-03-24T01:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
  },
  // Flink fraud_detection tables
  {
    id: 'tbl-7',
    database_id: 'db-7',
    name: 'suspicious_transactions',
    description: 'Flagged suspicious transactions',
    schema_definition: [
      { name: 'alert_id', type: 'VARCHAR', nullable: false, isPrimaryKey: true },
      { name: 'transaction_id', type: 'VARCHAR', nullable: false },
      { name: 'risk_score', type: 'DECIMAL(5,2)', nullable: false },
      { name: 'rule_triggered', type: 'VARCHAR', nullable: false },
      { name: 'detection_time', type: 'TIMESTAMP', nullable: false },
      { name: 'reviewed', type: 'BOOLEAN', nullable: false },
      { name: 'outcome', type: 'VARCHAR', nullable: true },
    ],
    row_count: 45000,
    last_updated: '2024-03-24T08:35:00Z',
    created_at: '2024-01-15T10:00:00Z',
  },
]

// Mock Procedures
export const mockProcedures: Procedure[] = [
  {
    id: 'proc-1',
    name: 'Get Transaction by ID',
    description: 'Retrieve a single transaction by its unique identifier',
    sql_query: `SELECT * FROM transactions WHERE transaction_id = :transaction_id`,
    parameters: [
      { name: 'transaction_id', type: 'string', label: 'Transaction ID', required: true },
    ],
    category: 'Transaction Lookup',
    is_public: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'proc-2',
    name: 'Daily Transaction Summary',
    description: 'Get daily transaction totals by type',
    sql_query: `SELECT 
      DATE(created_at) as transaction_date,
      transaction_type,
      COUNT(*) as total_count,
      SUM(amount) as total_amount
    FROM transactions
    WHERE DATE(created_at) BETWEEN :start_date AND :end_date
    GROUP BY DATE(created_at), transaction_type
    ORDER BY transaction_date DESC`,
    parameters: [
      { name: 'start_date', type: 'date', label: 'Start Date', required: true },
      { name: 'end_date', type: 'date', label: 'End Date', required: true },
    ],
    category: 'Reports',
    is_public: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'proc-3',
    name: 'Customer Transaction History',
    description: 'Get all transactions for a specific customer phone number',
    sql_query: `SELECT * FROM transactions 
    WHERE sender_phone = :phone_number OR receiver_phone = :phone_number
    ORDER BY created_at DESC
    LIMIT :limit`,
    parameters: [
      { name: 'phone_number', type: 'string', label: 'Phone Number (e.g., 254712345678)', required: true },
      { name: 'limit', type: 'number', label: 'Max Results', required: false, default_value: '100' },
    ],
    category: 'Customer',
    is_public: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'proc-4',
    name: 'High Value Transactions',
    description: 'Find transactions above a specified amount threshold',
    sql_query: `SELECT * FROM transactions 
    WHERE amount >= :min_amount
    AND DATE(created_at) BETWEEN :start_date AND :end_date
    ORDER BY amount DESC
    LIMIT 500`,
    parameters: [
      { name: 'min_amount', type: 'number', label: 'Minimum Amount (KES)', required: true, default_value: '100000' },
      { name: 'start_date', type: 'date', label: 'Start Date', required: true },
      { name: 'end_date', type: 'date', label: 'End Date', required: true },
    ],
    category: 'Compliance',
    is_public: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'proc-5',
    name: 'Failed Transactions Report',
    description: 'List all failed transactions within a date range',
    sql_query: `SELECT * FROM transactions 
    WHERE status = 'failed'
    AND DATE(created_at) BETWEEN :start_date AND :end_date
    ORDER BY created_at DESC`,
    parameters: [
      { name: 'start_date', type: 'date', label: 'Start Date', required: true },
      { name: 'end_date', type: 'date', label: 'End Date', required: true },
    ],
    category: 'Operations',
    is_public: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'proc-6',
    name: 'Fraud Alert Summary',
    description: 'Get summary of fraud alerts by risk level',
    sql_query: `SELECT 
      CASE 
        WHEN risk_score >= 80 THEN 'Critical'
        WHEN risk_score >= 60 THEN 'High'
        WHEN risk_score >= 40 THEN 'Medium'
        ELSE 'Low'
      END as risk_level,
      COUNT(*) as alert_count,
      AVG(risk_score) as avg_score
    FROM suspicious_transactions
    WHERE DATE(detection_time) BETWEEN :start_date AND :end_date
    GROUP BY risk_level
    ORDER BY avg_score DESC`,
    parameters: [
      { name: 'start_date', type: 'date', label: 'Start Date', required: true },
      { name: 'end_date', type: 'date', label: 'End Date', required: true },
    ],
    category: 'Compliance',
    is_public: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
]

// Generate mock transactions
function generateMockTransactions(count: number): Transaction[] {
  const transactionTypes: Transaction['transaction_type'][] = ['mpesa', 'bank_transfer', 'airtel_money', 'equity_pay', 'pesalink']
  const statuses: Transaction['status'][] = ['completed', 'pending', 'failed', 'reversed']
  const engines: DataEngine[] = ['druid', 'hive', 'drill', 'flink']
  
  const kenyanNames = [
    'John Kamau', 'Mary Wanjiku', 'Peter Ochieng', 'Grace Muthoni', 'David Kiprop',
    'Jane Akinyi', 'James Mwangi', 'Sarah Chebet', 'Michael Otieno', 'Nancy Njeri',
    'Robert Kimani', 'Elizabeth Auma', 'Joseph Mutua', 'Anne Wambui', 'Charles Ouma',
  ]
  
  const transactions: Transaction[] = []
  
  for (let i = 0; i < count; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const amount = Math.floor(Math.random() * 500000) + 100
    const senderIdx = Math.floor(Math.random() * kenyanNames.length)
    let receiverIdx = Math.floor(Math.random() * kenyanNames.length)
    while (receiverIdx === senderIdx) {
      receiverIdx = Math.floor(Math.random() * kenyanNames.length)
    }
    
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    
    transactions.push({
      id: `txn-${i + 1}`,
      transaction_id: `TXN${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
      amount,
      currency: 'KES',
      sender_name: kenyanNames[senderIdx],
      sender_phone: `2547${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      receiver_name: kenyanNames[receiverIdx],
      receiver_phone: `2547${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      transaction_type: type,
      status,
      reference: `REF${Math.floor(Math.random() * 1000000)}`,
      description: type === 'mpesa' ? 'M-Pesa Transfer' : type === 'bank_transfer' ? 'Bank Transfer' : 'Payment',
      fee: Math.floor(amount * 0.01),
      created_at: createdAt.toISOString(),
      completed_at: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 60000).toISOString() : undefined,
      source_engine: engines[Math.floor(Math.random() * engines.length)],
    })
  }
  
  return transactions
}

export const mockTransactions = generateMockTransactions(100)

// Mock query executor
export function executeMockQuery(
  query: string,
  params: Record<string, unknown> = {}
): QueryResult {
  const startTime = Date.now()
  
  // Simple mock logic based on query content
  let results: Record<string, unknown>[] = []
  
  if (query.toLowerCase().includes('transaction_id')) {
    const txnId = params.transaction_id as string
    const found = mockTransactions.filter(t => 
      t.transaction_id.toLowerCase().includes(txnId?.toLowerCase() || '')
    )
    results = found.slice(0, 10)
  } else if (query.toLowerCase().includes('phone_number')) {
    const phone = params.phone_number as string
    const found = mockTransactions.filter(t => 
      t.sender_phone.includes(phone || '') || t.receiver_phone.includes(phone || '')
    )
    results = found.slice(0, Number(params.limit) || 100)
  } else if (query.toLowerCase().includes('min_amount')) {
    const minAmount = Number(params.min_amount) || 100000
    const found = mockTransactions.filter(t => t.amount >= minAmount)
    results = found.slice(0, 500)
  } else if (query.toLowerCase().includes('failed')) {
    const found = mockTransactions.filter(t => t.status === 'failed')
    results = found
  } else if (query.toLowerCase().includes('group by')) {
    // Return aggregated mock data
    results = [
      { transaction_date: '2024-03-24', transaction_type: 'mpesa', total_count: 15420, total_amount: 45230000 },
      { transaction_date: '2024-03-24', transaction_type: 'bank_transfer', total_count: 8750, total_amount: 125000000 },
      { transaction_date: '2024-03-23', transaction_type: 'mpesa', total_count: 14890, total_amount: 43120000 },
      { transaction_date: '2024-03-23', transaction_type: 'bank_transfer', total_count: 8320, total_amount: 118000000 },
    ]
  } else {
    results = mockTransactions.slice(0, 50)
  }
  
  return {
    columns: results.length > 0 ? Object.keys(results[0]) : [],
    rows: results,
    row_count: results.length,
    execution_time_ms: Date.now() - startTime + Math.floor(Math.random() * 500),
    source_engine: 'druid',
  }
}
