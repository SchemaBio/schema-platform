-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL DEFAULT 'UNKNOWN',
    birth_date DATE,
    phenotypes JSONB DEFAULT '[]',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_patients_created_by ON patients(created_by);
CREATE INDEX idx_patients_deleted_at ON patients(deleted_at);

-- Batches table
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_batches_created_by ON batches(created_by);
CREATE INDEX idx_batches_status ON batches(status);

-- Samples table
CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    sample_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    batch_id UUID REFERENCES batches(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_samples_patient_id ON samples(patient_id);
CREATE INDEX idx_samples_batch_id ON samples(batch_id);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_created_by ON samples(created_by);
CREATE INDEX idx_samples_deleted_at ON samples(deleted_at);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    display_settings JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    analysis_settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- System config table
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_config_key ON system_config(key);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- Role permissions table (many-to-many)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Insert all permissions
INSERT INTO permissions (code, name, description, resource, action) VALUES
    -- User permissions
    ('user:list', 'List Users', 'View list of users', 'users', 'list'),
    ('user:create', 'Create User', 'Create new users', 'users', 'create'),
    ('user:read', 'Read User', 'View user details', 'users', 'read'),
    ('user:update', 'Update User', 'Update user details', 'users', 'update'),
    ('user:delete', 'Delete User', 'Delete users', 'users', 'delete'),
    ('user:activate', 'Activate User', 'Activate user accounts', 'users', 'activate'),
    ('user:deactivate', 'Deactivate User', 'Deactivate user accounts', 'users', 'deactivate'),

    -- Team permissions
    ('team:list', 'List Teams', 'View list of teams', 'teams', 'list'),
    ('team:create', 'Create Team', 'Create new teams', 'teams', 'create'),
    ('team:read', 'Read Team', 'View team details', 'teams', 'read'),
    ('team:update', 'Update Team', 'Update team details', 'teams', 'update'),
    ('team:delete', 'Delete Team', 'Delete teams', 'teams', 'delete'),

    -- Patient permissions
    ('patient:list', 'List Patients', 'View list of patients', 'patients', 'list'),
    ('patient:create', 'Create Patient', 'Create new patients', 'patients', 'create'),
    ('patient:read', 'Read Patient', 'View patient details', 'patients', 'read'),
    ('patient:update', 'Update Patient', 'Update patient details', 'patients', 'update'),
    ('patient:delete', 'Delete Patient', 'Delete patients', 'patients', 'delete'),

    -- Sample permissions
    ('sample:list', 'List Samples', 'View list of samples', 'samples', 'list'),
    ('sample:create', 'Create Sample', 'Create new samples', 'samples', 'create'),
    ('sample:read', 'Read Sample', 'View sample details', 'samples', 'read'),
    ('sample:update', 'Update Sample', 'Update sample details', 'samples', 'update'),
    ('sample:delete', 'Delete Sample', 'Delete samples', 'samples', 'delete'),

    -- Batch permissions
    ('batch:list', 'List Batches', 'View list of batches', 'batches', 'list'),
    ('batch:create', 'Create Batch', 'Create new batches', 'batches', 'create'),
    ('batch:read', 'Read Batch', 'View batch details', 'batches', 'read'),
    ('batch:update', 'Update Batch', 'Update batch details', 'batches', 'update'),
    ('batch:delete', 'Delete Batch', 'Delete batches', 'batches', 'delete'),

    -- Settings permissions
    ('settings:manage', 'Manage Settings', 'Manage system settings', 'settings', 'manage');

-- Insert role permissions
-- Admin gets all permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'ADMIN', id FROM permissions;

-- Doctor permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'DOCTOR', id FROM permissions WHERE code IN (
    'user:read',
    'team:list', 'team:read',
    'patient:list', 'patient:create', 'patient:read', 'patient:update',
    'sample:list', 'sample:create', 'sample:read', 'sample:update',
    'batch:list', 'batch:read'
);

-- Analyst permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'ANALYST', id FROM permissions WHERE code IN (
    'user:read',
    'team:list', 'team:read',
    'patient:list', 'patient:read',
    'sample:list', 'sample:read', 'sample:update',
    'batch:list', 'batch:create', 'batch:read', 'batch:update'
);

-- Viewer permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'VIEWER', id FROM permissions WHERE code IN (
    'user:read',
    'team:list', 'team:read',
    'patient:list', 'patient:read',
    'sample:list', 'sample:read',
    'batch:list', 'batch:read'
);

-- ============================================
-- GERMLINE TABLES (家系分析相关表)
-- ============================================

-- Gene lists table
CREATE TABLE gene_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    genes JSONB NOT NULL DEFAULT '[]',
    category VARCHAR(50) NOT NULL DEFAULT 'optional',
    disease_category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_gene_lists_name ON gene_lists(name);
CREATE INDEX idx_gene_lists_category ON gene_lists(category);
CREATE INDEX idx_gene_lists_deleted_at ON gene_lists(deleted_at);

-- Pedigrees table (家系表)
CREATE TABLE pedigrees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    disease VARCHAR(255),
    proband_member_id UUID,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pedigrees_name ON pedigrees(name);
CREATE INDEX idx_pedigrees_proband_member_id ON pedigrees(proband_member_id);
CREATE INDEX idx_pedigrees_deleted_at ON pedigrees(deleted_at);

-- Pedigree members table (家系成员表)
CREATE TABLE pedigree_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedigree_id UUID NOT NULL REFERENCES pedigrees(id) ON DELETE CASCADE,
    sample_id UUID,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    birth_year INTEGER,
    is_deceased BOOLEAN NOT NULL DEFAULT false,
    deceased_year INTEGER,
    relation VARCHAR(50) NOT NULL,
    affected_status VARCHAR(20) NOT NULL,
    phenotypes JSONB DEFAULT '[]',
    father_id UUID REFERENCES pedigree_members(id),
    mother_id UUID REFERENCES pedigree_members(id),
    generation INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pedigree_members_pedigree_id ON pedigree_members(pedigree_id);
CREATE INDEX idx_pedigree_members_sample_id ON pedigree_members(sample_id);
CREATE INDEX idx_pedigree_members_relation ON pedigree_members(relation);
CREATE INDEX idx_pedigree_members_affected_status ON pedigree_members(affected_status);
CREATE INDEX idx_pedigree_members_father_id ON pedigree_members(father_id);
CREATE INDEX idx_pedigree_members_mother_id ON pedigree_members(mother_id);
CREATE INDEX idx_pedigree_members_deleted_at ON pedigree_members(deleted_at);

-- Sanger validations table
CREATE TABLE sanger_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL,
    variant_id VARCHAR(255),
    variant_type VARCHAR(20),
    gene VARCHAR(50),
    chromosome VARCHAR(10),
    position BIGINT,
    hgvsc VARCHAR(50),
    hgvsp VARCHAR(50),
    zygosity VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    result VARCHAR(50),
    primer_forward VARCHAR(100),
    primer_reverse VARCHAR(100),
    product_size INTEGER,
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sanger_validations_task_id ON sanger_validations(task_id);
CREATE INDEX idx_sanger_validations_variant_id ON sanger_validations(variant_id);
CREATE INDEX idx_sanger_validations_gene ON sanger_validations(gene);
CREATE INDEX idx_sanger_validations_status ON sanger_validations(status);
CREATE INDEX idx_sanger_validations_requested_by ON sanger_validations(requested_by);
CREATE INDEX idx_sanger_validations_deleted_at ON sanger_validations(deleted_at);
