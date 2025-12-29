CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'team_member' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft' NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);

CREATE TABLE IF NOT EXISTS budget_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  project_id uuid NOT NULL,
  budget_item_id text NOT NULL,
  category text NOT NULL,
  estimated_cost decimal(15,2) DEFAULT 0 NOT NULL,
  actual_cost decimal(15,2) DEFAULT 0 NOT NULL,
  variance decimal(15,2),
  fiscal_period text,
  cost_center text,
  approval_status text DEFAULT 'pending' NOT NULL,
  approved_by uuid,
  approval_date timestamp with time zone,
  forecast_remaining decimal(15,2),
  contingency_percentage decimal(5,2),
  last_review_date timestamp with time zone,
  justification text,
  funding_source text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON budget_items (project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_approval_status ON budget_items (approval_status);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget_item_id ON budget_items (budget_item_id);

CREATE TABLE IF NOT EXISTS project_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  project_id uuid NOT NULL UNIQUE,
  planning_start_date date,
  planning_complete_date date,
  methodology text,
  tools_to_be_used text,
  deliverables text,
  dependencies text,
  quality_standards text,
  communication_plan text,
  change_control_process text,
  planning_assumptions text,
  planning_constraints text,
  planning_risks text,
  planning_approval_date timestamp with time zone,
  baseline_scope text,
  baseline_schedule text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_project_plans_project_id ON project_plans (project_id);

CREATE TABLE IF NOT EXISTS workflow_transitions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  project_id uuid NOT NULL,
  from_workflow text,
  to_workflow text NOT NULL,
  transitioned_by uuid NOT NULL,
  transitioned_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'completed' NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_project_id ON workflow_transitions (project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_transitioned_at ON workflow_transitions (transitioned_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  changes jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);