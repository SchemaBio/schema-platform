-- ============================================
-- ROLLBACK MULTI-TENANT MIGRATION
-- ============================================

-- Step 1: Re-add role column to users
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'VIEWER';

-- Step 2: Restore user roles from org_members
UPDATE users u SET role = om.org_role
FROM org_members om
WHERE u.id = om.user_id
AND om.org_id = '00000000-0000-0000-0000-000000000001';

-- Convert OWNER back to ADMIN
UPDATE users SET role = 'ADMIN' WHERE role = 'OWNER';

-- Step 3: Recreate teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);

-- Step 4: Recreate team_members table
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

-- Step 5: Recreate role_permissions table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Step 6: Restore team permissions
INSERT INTO permissions (code, name, description, resource, action) VALUES
    ('team:list', 'List Teams', 'View list of teams', 'teams', 'list'),
    ('team:create', 'Create Team', 'Create new teams', 'teams', 'create'),
    ('team:read', 'Read Team', 'View team details', 'teams', 'read'),
    ('team:update', 'Update Team', 'Update team details', 'teams', 'update'),
    ('team:delete', 'Delete Team', 'Delete teams', 'teams', 'delete');

-- Step 7: Restore role permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'ADMIN', id FROM permissions;

INSERT INTO role_permissions (role, permission_id)
SELECT 'DOCTOR', id FROM permissions WHERE code IN (
    'user:read',
    'team:list', 'team:read',
    'patient:list', 'patient:create', 'patient:read', 'patient:update',
    'sample:list', 'sample:create', 'sample:read', 'sample:update',
    'batch:list', 'batch:read'
);

INSERT INTO role_permissions (role, permission_id)
SELECT 'ANALYST', id FROM permissions WHERE code IN (
    'user:read',
    'team:list', 'team:read',
    'patient:list', 'patient:read',
    'sample:list', 'sample:read', 'sample:update',
    'batch:list', 'batch:create', 'batch:read', 'batch:update'
);

INSERT INTO role_permissions (role, permission_id)
SELECT 'VIEWER', id FROM permissions WHERE code IN (
    'user:read',
    'team:list', 'team:read',
    'patient:list', 'patient:read',
    'sample:list', 'sample:read',
    'batch:list', 'batch:read'
);

-- Step 8: Remove organization permissions
DELETE FROM permissions WHERE code LIKE 'org:%';

-- Step 9: Drop org_role_permissions table
DROP TABLE org_role_permissions;

-- Step 10: Remove org_id columns from business tables
ALTER TABLE patients DROP CONSTRAINT IF EXISTS fk_patients_org;
ALTER TABLE batches DROP CONSTRAINT IF EXISTS fk_batches_org;
ALTER TABLE samples DROP CONSTRAINT IF EXISTS fk_samples_org;
ALTER TABLE gene_lists DROP CONSTRAINT IF EXISTS fk_gene_lists_org;
ALTER TABLE pedigrees DROP CONSTRAINT IF EXISTS fk_pedigrees_org;
ALTER TABLE sanger_validations DROP CONSTRAINT IF EXISTS fk_sanger_validations_org;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS fk_audit_logs_org;

ALTER TABLE patients DROP COLUMN org_id;
ALTER TABLE batches DROP COLUMN org_id;
ALTER TABLE samples DROP COLUMN org_id;
ALTER TABLE gene_lists DROP COLUMN org_id;
ALTER TABLE pedigrees DROP COLUMN org_id;
ALTER TABLE sanger_validations DROP COLUMN org_id;
ALTER TABLE audit_logs DROP COLUMN org_id;

-- Step 11: Remove system_role and primary_org_id from users
ALTER TABLE users DROP COLUMN system_role;
ALTER TABLE users DROP COLUMN primary_org_id;

-- Step 12: Drop org_members table
DROP TABLE org_members;

-- Step 13: Drop organizations table
DROP TABLE organizations;