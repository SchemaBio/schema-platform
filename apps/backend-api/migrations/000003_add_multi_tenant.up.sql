-- ============================================
-- MULTI-TENANT MIGRATION
-- ============================================

-- Step 1: Create organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    settings JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    plan VARCHAR(20) NOT NULL DEFAULT 'SELF_HOSTED',
    max_users INTEGER DEFAULT -1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);

-- Step 2: Create org_members table
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    org_role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    UNIQUE(user_id, org_id)
);

CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_org_role ON org_members(org_role);

-- Step 3: Add new columns to users table
ALTER TABLE users ADD COLUMN system_role VARCHAR(20) NOT NULL DEFAULT 'USER';
ALTER TABLE users ADD COLUMN primary_org_id UUID REFERENCES organizations(id);

CREATE INDEX idx_users_system_role ON users(system_role);
CREATE INDEX idx_users_primary_org_id ON users(primary_org_id);

-- Step 4: Create org_role_permissions table
CREATE TABLE org_role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_role VARCHAR(20) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(org_role, permission_id)
);

CREATE INDEX idx_org_role_permissions_org_role ON org_role_permissions(org_role);
CREATE INDEX idx_org_role_permissions_permission_id ON org_role_permissions(permission_id);

-- Step 5: Add organization permissions
INSERT INTO permissions (code, name, description, resource, action) VALUES
    ('org:manage', 'Manage Organization', 'Manage organization settings', 'organizations', 'manage'),
    ('org:user:create', 'Create Org User', 'Create users in organization', 'organizations', 'user_create'),
    ('org:user:delete', 'Delete Org User', 'Remove users from organization', 'organizations', 'user_delete'),
    ('org:user:update', 'Update Org User Role', 'Update user roles in organization', 'organizations', 'user_update'),
    ('org:user:invite', 'Invite Org User', 'Invite users to organization', 'organizations', 'user_invite');

-- Step 6: Insert org role permissions
-- OWNER gets all permissions
INSERT INTO org_role_permissions (org_role, permission_id)
SELECT 'OWNER', id FROM permissions;

-- ADMIN gets most permissions (not org:manage)
INSERT INTO org_role_permissions (org_role, permission_id)
SELECT 'ADMIN', id FROM permissions WHERE code != 'org:manage';

-- DOCTOR permissions
INSERT INTO org_role_permissions (org_role, permission_id)
SELECT 'DOCTOR', id FROM permissions WHERE code IN (
    'user:read',
    'patient:list', 'patient:create', 'patient:read', 'patient:update',
    'sample:list', 'sample:create', 'sample:read', 'sample:update',
    'batch:list', 'batch:read'
);

-- ANALYST permissions
INSERT INTO org_role_permissions (org_role, permission_id)
SELECT 'ANALYST', id FROM permissions WHERE code IN (
    'user:read',
    'patient:list', 'patient:read',
    'sample:list', 'sample:read', 'sample:update',
    'batch:list', 'batch:create', 'batch:read', 'batch:update'
);

-- VIEWER permissions
INSERT INTO org_role_permissions (org_role, permission_id)
SELECT 'VIEWER', id FROM permissions WHERE code IN (
    'user:read',
    'patient:list', 'patient:read',
    'sample:list', 'sample:read',
    'batch:list', 'batch:read'
);

-- Step 7: Add org_id to business tables
ALTER TABLE patients ADD COLUMN org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE batches ADD COLUMN org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE samples ADD COLUMN org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE gene_lists ADD COLUMN org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE pedigrees ADD COLUMN org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE sanger_validations ADD COLUMN org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE audit_logs ADD COLUMN org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Step 8: Create default organization
INSERT INTO organizations (id, name, slug, description, status, plan, max_users)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Default Organization',
    'default',
    'Default organization for single-tenant deployment',
    'ACTIVE',
    'SELF_HOSTED',
    -1
);

-- Step 9: Migrate existing users to org_members
-- Map old roles to new org roles
INSERT INTO org_members (user_id, org_id, org_role, joined_at)
SELECT
    id,
    '00000000-0000-0000-0000-000000000001',
    CASE
        WHEN role = 'ADMIN' THEN 'OWNER'
        ELSE role
    END,
    created_at
FROM users
WHERE deleted_at IS NULL;

-- Step 10: Set primary_org_id for existing users
UPDATE users SET primary_org_id = '00000000-0000-0000-0000-000000000001'
WHERE deleted_at IS NULL;

-- Step 11: Set super admin for users who were ADMIN
UPDATE users SET system_role = 'SUPER_ADMIN' WHERE role = 'ADMIN';

-- Step 12: Migrate business data to default organization
UPDATE patients SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE batches SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE samples SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE gene_lists SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE pedigrees SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE sanger_validations SET org_id = '00000000-0000-0000-0000-000000000001';
UPDATE audit_logs SET org_id = '00000000-0000-0000-0000-000000000001';

-- Step 13: Add foreign key constraints for org_id
ALTER TABLE patients ADD CONSTRAINT fk_patients_org FOREIGN KEY (org_id) REFERENCES organizations(id);
ALTER TABLE batches ADD CONSTRAINT fk_batches_org FOREIGN KEY (org_id) REFERENCES organizations(id);
ALTER TABLE samples ADD CONSTRAINT fk_samples_org FOREIGN KEY (org_id) REFERENCES organizations(id);
ALTER TABLE gene_lists ADD CONSTRAINT fk_gene_lists_org FOREIGN KEY (org_id) REFERENCES organizations(id);
ALTER TABLE pedigrees ADD CONSTRAINT fk_pedigrees_org FOREIGN KEY (org_id) REFERENCES organizations(id);
ALTER TABLE sanger_validations ADD CONSTRAINT fk_sanger_validations_org FOREIGN KEY (org_id) REFERENCES organizations(id);
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_org FOREIGN KEY (org_id) REFERENCES organizations(id);

-- Step 14: Create indexes for org_id
CREATE INDEX idx_patients_org_id ON patients(org_id);
CREATE INDEX idx_batches_org_id ON batches(org_id);
CREATE INDEX idx_samples_org_id ON samples(org_id);
CREATE INDEX idx_gene_lists_org_id ON gene_lists(org_id);
CREATE INDEX idx_pedigrees_org_id ON pedigrees(org_id);
CREATE INDEX idx_sanger_validations_org_id ON sanger_validations(org_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);

-- Step 15: Remove old role column from users (after migration)
ALTER TABLE users DROP COLUMN role;

-- Step 16: Drop old role_permissions table (replaced by org_role_permissions)
DROP TABLE role_permissions;

-- Step 17: Drop teams and team_members tables
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;

-- Step 18: Remove team permissions from permissions table
DELETE FROM permissions WHERE code LIKE 'team:%';