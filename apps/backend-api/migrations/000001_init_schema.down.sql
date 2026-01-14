-- Drop tables in reverse order of creation
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
