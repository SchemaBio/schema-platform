-- Remove report tables and sample redo fields

-- Drop foreign key constraints first
ALTER TABLE reports
    DROP CONSTRAINT IF EXISTS fk_reports_org,
    DROP CONSTRAINT IF EXISTS fk_reports_task,
    DROP CONSTRAINT IF EXISTS fk_reports_template;

ALTER TABLE report_templates
    DROP CONSTRAINT IF EXISTS fk_report_templates_org;

ALTER TABLE samples
    DROP CONSTRAINT IF EXISTS fk_samples_parent_sample;

-- Drop indexes
DROP INDEX IF EXISTS idx_reports_org_id;
DROP INDEX IF EXISTS idx_reports_task_id;
DROP INDEX IF EXISTS idx_reports_template_id;
DROP INDEX IF EXISTS idx_reports_status;
DROP INDEX IF EXISTS idx_reports_deleted_at;
DROP INDEX IF EXISTS idx_report_templates_org_id;
DROP INDEX IF EXISTS idx_report_templates_deleted_at;
DROP INDEX IF EXISTS idx_samples_parent_sample_id;

-- Drop tables
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS report_templates;

-- Remove sample redo fields
ALTER TABLE samples DROP COLUMN IF EXISTS parent_sample_id;
ALTER TABLE samples DROP COLUMN IF EXISTS redo_reason;