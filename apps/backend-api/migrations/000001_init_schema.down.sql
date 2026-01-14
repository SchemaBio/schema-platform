-- Drop tables in reverse order of creation

-- Drop Germline tables first (they may have foreign keys)
DROP TABLE IF EXISTS sanger_validations;
DROP TABLE IF EXISTS pedigree_members;
DROP TABLE IF EXISTS pedigrees;
DROP TABLE IF EXISTS gene_lists;

-- Drop other tables
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS system_config;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS samples;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

-- Drop UUID extension
DROP EXTENSION IF EXISTS "uuid-ossp";
