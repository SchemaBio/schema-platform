-- Add report tables and sample redo fields

-- Create report_templates table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_path VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_report_templates_org_id ON report_templates(org_id);
CREATE INDEX idx_report_templates_deleted_at ON report_templates(deleted_at);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    task_id UUID NOT NULL,
    template_id UUID,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_type VARCHAR(20),
    report_type VARCHAR(20),
    created_by UUID NOT NULL,
    reviewed_by UUID,
    approved_by UUID,
    released_by UUID,
    reviewed_at TIMESTAMP,
    approved_at TIMESTAMP,
    released_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_reports_org_id ON reports(org_id);
CREATE INDEX idx_reports_task_id ON reports(task_id);
CREATE INDEX idx_reports_template_id ON reports(template_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_deleted_at ON reports(deleted_at);

-- Add sample redo fields to samples table
ALTER TABLE samples ADD COLUMN IF NOT EXISTS parent_sample_id UUID;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS redo_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_samples_parent_sample_id ON samples(parent_sample_id);

-- Add foreign key constraints
ALTER TABLE report_templates
    ADD CONSTRAINT fk_report_templates_org FOREIGN KEY (org_id) REFERENCES organizations(id);

ALTER TABLE reports
    ADD CONSTRAINT fk_reports_org FOREIGN KEY (org_id) REFERENCES organizations(id),
    ADD CONSTRAINT fk_reports_task FOREIGN KEY (task_id) REFERENCES analysis_tasks(id),
    ADD CONSTRAINT fk_reports_template FOREIGN KEY (template_id) REFERENCES report_templates(id);

ALTER TABLE samples
    ADD CONSTRAINT fk_samples_parent_sample FOREIGN KEY (parent_sample_id) REFERENCES samples(id);