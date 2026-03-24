-- Unified Data Query Platform Schema
-- Creates all necessary tables for the data platform

-- User profiles with role-based access
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin', 'engineer', 'analyst', 'viewer')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data sources (Druid, Hive, Drill, Flink)
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('druid', 'hive', 'drill', 'flink')),
  description TEXT,
  connection_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Databases within each data source
CREATE TABLE IF NOT EXISTS public.databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables within each database
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id UUID NOT NULL REFERENCES public.databases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  columns_schema JSONB DEFAULT '[]',
  row_count_estimate BIGINT DEFAULT 0,
  is_partitioned BOOLEAN DEFAULT false,
  partition_columns TEXT[],
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved procedures/queries
CREATE TABLE IF NOT EXISTS public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  query_template TEXT NOT NULL,
  data_source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
  parameters JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query execution history
CREATE TABLE IF NOT EXISTS public.query_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  data_source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result_summary JSONB,
  error_message TEXT,
  row_count INTEGER,
  execution_time_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Output destinations (email, folder, etc.)
CREATE TABLE IF NOT EXISTS public.output_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'folder', 'display')),
  config JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved queries for users
CREATE TABLE IF NOT EXISTS public.saved_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query_config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.output_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for data_sources (all authenticated users can read)
CREATE POLICY "data_sources_select_all" ON public.data_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "data_sources_manage_admin" ON public.data_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for databases (all authenticated users can read)
CREATE POLICY "databases_select_all" ON public.databases FOR SELECT TO authenticated USING (true);
CREATE POLICY "databases_manage_admin" ON public.databases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for tables (all authenticated users can read)
CREATE POLICY "tables_select_all" ON public.tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "tables_manage_admin" ON public.tables FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for procedures (public ones visible to all, own visible to creator)
CREATE POLICY "procedures_select_public" ON public.procedures FOR SELECT TO authenticated USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "procedures_insert_own" ON public.procedures FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "procedures_update_own" ON public.procedures FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "procedures_delete_own" ON public.procedures FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- RLS Policies for query_executions (users see their own)
CREATE POLICY "query_executions_select_own" ON public.query_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "query_executions_insert_own" ON public.query_executions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "query_executions_update_own" ON public.query_executions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for output_destinations (users manage their own)
CREATE POLICY "output_destinations_select_own" ON public.output_destinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "output_destinations_insert_own" ON public.output_destinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "output_destinations_update_own" ON public.output_destinations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "output_destinations_delete_own" ON public.output_destinations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_queries (users manage their own)
CREATE POLICY "saved_queries_select_own" ON public.saved_queries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_queries_insert_own" ON public.saved_queries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_queries_update_own" ON public.saved_queries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_queries_delete_own" ON public.saved_queries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audit_logs (users see their own, admins see all)
CREATE POLICY "audit_logs_select_own" ON public.audit_logs FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "audit_logs_insert_all" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'analyst')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_databases_data_source ON public.databases(data_source_id);
CREATE INDEX IF NOT EXISTS idx_tables_database ON public.tables(database_id);
CREATE INDEX IF NOT EXISTS idx_procedures_created_by ON public.procedures(created_by);
CREATE INDEX IF NOT EXISTS idx_query_executions_user ON public.query_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_query_executions_status ON public.query_executions(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
