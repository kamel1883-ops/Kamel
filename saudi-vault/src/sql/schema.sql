-- ============================================================
-- Saudi Data Vault — database schema
-- كل القيم الحساسة تُخزّن مشفّرة AES-256-GCM في أعمدة *_enc
-- ============================================================

-- بيانات الموظفين الحساسة (هوية، إقامة، جواز، حساب بنكي، اتصال)
CREATE TABLE IF NOT EXISTS vault_employees (
  emp_ref            TEXT PRIMARY KEY,
  tenant_id          TEXT NOT NULL,
  full_name_enc      TEXT,
  national_id_enc    TEXT,
  passport_number_enc TEXT,
  bank_account_enc   TEXT,
  birth_date_enc     TEXT,
  phone_enc          TEXT,
  address_enc        TEXT,
  emergency_contact_enc TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vault_employees_tenant ON vault_employees(tenant_id);

-- القيم المالية الحساسة (رواتب، بدلات، تأمينات)
CREATE TABLE IF NOT EXISTS vault_payroll (
  payroll_ref        TEXT PRIMARY KEY,
  emp_ref            TEXT NOT NULL,
  tenant_id          TEXT NOT NULL,
  period_key         TEXT,
  base_salary_enc    TEXT,
  housing_enc        TEXT,
  transport_enc      TEXT,
  other_enc          TEXT,
  gross_enc          TEXT,
  net_enc            TEXT,
  gosi_employee_enc  TEXT,
  gosi_employer_enc  TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (emp_ref) REFERENCES vault_employees(emp_ref) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vault_payroll_emp ON vault_payroll(emp_ref);
CREATE INDEX IF NOT EXISTS idx_vault_payroll_tenant_period ON vault_payroll(tenant_id, period_key);

-- المستندات المُولّدة (مخالصات، عقود، تسويات، قرارات) — الملف على القرص المحلي
CREATE TABLE IF NOT EXISTS vault_documents (
  doc_ref     TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  emp_ref     TEXT,
  doc_type    TEXT NOT NULL,
  file_name   TEXT,
  mime_type   TEXT,
  file_path   TEXT NOT NULL,
  sha256      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vault_documents_tenant ON vault_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vault_documents_emp ON vault_documents(emp_ref);