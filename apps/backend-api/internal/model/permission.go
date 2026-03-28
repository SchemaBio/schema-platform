package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Permission represents a permission in the system
type Permission struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code        string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Resource    string         `gorm:"type:varchar(100);not null" json:"resource"`
	Action      string         `gorm:"type:varchar(50);not null" json:"action"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
}

// TableName returns the table name for Permission
func (Permission) TableName() string {
	return "permissions"
}

// OrgRolePermission represents the many-to-many relationship between org roles and permissions
type OrgRolePermission struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrgRole      OrgRole   `gorm:"type:varchar(20);not null" json:"orgRole"`
	PermissionID uuid.UUID `gorm:"type:uuid;not null" json:"permissionId"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// TableName returns the table name for OrgRolePermission
func (OrgRolePermission) TableName() string {
	return "org_role_permissions"
}

// Define all permissions in the system
var (
	// User permissions
	PermissionUserList       = &Permission{Code: "user:list", Name: "List Users", Description: "View list of users", Resource: "users", Action: "list"}
	PermissionUserCreate     = &Permission{Code: "user:create", Name: "Create User", Description: "Create new users", Resource: "users", Action: "create"}
	PermissionUserRead       = &Permission{Code: "user:read", Name: "Read User", Description: "View user details", Resource: "users", Action: "read"}
	PermissionUserUpdate     = &Permission{Code: "user:update", Name: "Update User", Description: "Update user details", Resource: "users", Action: "update"}
	PermissionUserDelete     = &Permission{Code: "user:delete", Name: "Delete User", Description: "Delete users", Resource: "users", Action: "delete"}
	PermissionUserActivate   = &Permission{Code: "user:activate", Name: "Activate User", Description: "Activate user accounts", Resource: "users", Action: "activate"}
	PermissionUserDeactivate = &Permission{Code: "user:deactivate", Name: "Deactivate User", Description: "Deactivate user accounts", Resource: "users", Action: "deactivate"}

	// Organization permissions (for org management)
	PermissionOrgManage       = &Permission{Code: "org:manage", Name: "Manage Organization", Description: "Manage organization settings", Resource: "organizations", Action: "manage"}
	PermissionOrgUserCreate   = &Permission{Code: "org:user:create", Name: "Create Org User", Description: "Create users in organization", Resource: "organizations", Action: "user_create"}
	PermissionOrgUserDelete   = &Permission{Code: "org:user:delete", Name: "Delete Org User", Description: "Remove users from organization", Resource: "organizations", Action: "user_delete"}
	PermissionOrgUserUpdate   = &Permission{Code: "org:user:update", Name: "Update Org User Role", Description: "Update user roles in organization", Resource: "organizations", Action: "user_update"}
	PermissionOrgUserInvite   = &Permission{Code: "org:user:invite", Name: "Invite Org User", Description: "Invite users to organization", Resource: "organizations", Action: "user_invite"}

	// Patient permissions
	PermissionPatientList     = &Permission{Code: "patient:list", Name: "List Patients", Description: "View list of patients", Resource: "patients", Action: "list"}
	PermissionPatientCreate   = &Permission{Code: "patient:create", Name: "Create Patient", Description: "Create new patients", Resource: "patients", Action: "create"}
	PermissionPatientRead     = &Permission{Code: "patient:read", Name: "Read Patient", Description: "View patient details", Resource: "patients", Action: "read"}
	PermissionPatientUpdate   = &Permission{Code: "patient:update", Name: "Update Patient", Description: "Update patient details", Resource: "patients", Action: "update"}
	PermissionPatientDelete   = &Permission{Code: "patient:delete", Name: "Delete Patient", Description: "Delete patients", Resource: "patients", Action: "delete"}

	// Sample permissions
	PermissionSampleList     = &Permission{Code: "sample:list", Name: "List Samples", Description: "View list of samples", Resource: "samples", Action: "list"}
	PermissionSampleCreate   = &Permission{Code: "sample:create", Name: "Create Sample", Description: "Create new samples", Resource: "samples", Action: "create"}
	PermissionSampleRead     = &Permission{Code: "sample:read", Name: "Read Sample", Description: "View sample details", Resource: "samples", Action: "read"}
	PermissionSampleUpdate   = &Permission{Code: "sample:update", Name: "Update Sample", Description: "Update sample details", Resource: "samples", Action: "update"}
	PermissionSampleDelete   = &Permission{Code: "sample:delete", Name: "Delete Sample", Description: "Delete samples", Resource: "samples", Action: "delete"}

	// Batch permissions
	PermissionBatchList     = &Permission{Code: "batch:list", Name: "List Batches", Description: "View list of batches", Resource: "batches", Action: "list"}
	PermissionBatchCreate   = &Permission{Code: "batch:create", Name: "Create Batch", Description: "Create new batches", Resource: "batches", Action: "create"}
	PermissionBatchRead     = &Permission{Code: "batch:read", Name: "Read Batch", Description: "View batch details", Resource: "batches", Action: "read"}
	PermissionBatchUpdate   = &Permission{Code: "batch:update", Name: "Update Batch", Description: "Update batch details", Resource: "batches", Action: "update"}
	PermissionBatchDelete   = &Permission{Code: "batch:delete", Name: "Delete Batch", Description: "Delete batches", Resource: "batches", Action: "delete"}

	// Settings permissions
	PermissionSettingsManage = &Permission{Code: "settings:manage", Name: "Manage Settings", Description: "Manage system settings", Resource: "settings", Action: "manage"}
)

// AllPermissions returns all permissions
func AllPermissions() []*Permission {
	return []*Permission{
		// User permissions
		PermissionUserList, PermissionUserCreate, PermissionUserRead,
		PermissionUserUpdate, PermissionUserDelete, PermissionUserActivate, PermissionUserDeactivate,

		// Organization permissions
		PermissionOrgManage, PermissionOrgUserCreate, PermissionOrgUserDelete, PermissionOrgUserUpdate, PermissionOrgUserInvite,

		// Patient permissions
		PermissionPatientList, PermissionPatientCreate, PermissionPatientRead,
		PermissionPatientUpdate, PermissionPatientDelete,

		// Sample permissions
		PermissionSampleList, PermissionSampleCreate, PermissionSampleRead,
		PermissionSampleUpdate, PermissionSampleDelete,

		// Batch permissions
		PermissionBatchList, PermissionBatchCreate, PermissionBatchRead,
		PermissionBatchUpdate, PermissionBatchDelete,

		// Settings
		PermissionSettingsManage,
	}
}

// OrgRolePermissions defines the default permissions for each org role
// OWNER inherits all ADMIN permissions plus organization management
var OrgRolePermissions = map[OrgRole][]*Permission{
	OrgRoleOwner: AllPermissions(), // Owners have all permissions including org management

	OrgRoleAdmin: {
		// User permissions (within org)
		PermissionUserList, PermissionUserCreate, PermissionUserRead,
		PermissionUserUpdate, PermissionUserActivate, PermissionUserDeactivate,

		// Organization permissions (limited)
		PermissionOrgUserCreate, PermissionOrgUserInvite,

		// Patient permissions
		PermissionPatientList, PermissionPatientCreate, PermissionPatientRead, PermissionPatientUpdate, PermissionPatientDelete,

		// Sample permissions
		PermissionSampleList, PermissionSampleCreate, PermissionSampleRead, PermissionSampleUpdate, PermissionSampleDelete,

		// Batch permissions
		PermissionBatchList, PermissionBatchCreate, PermissionBatchRead, PermissionBatchUpdate, PermissionBatchDelete,

		// Settings
		PermissionSettingsManage,
	},

	OrgRoleDoctor: {
		// User permissions
		PermissionUserRead,

		// Patient permissions
		PermissionPatientList, PermissionPatientCreate, PermissionPatientRead, PermissionPatientUpdate,

		// Sample permissions
		PermissionSampleList, PermissionSampleCreate, PermissionSampleRead, PermissionSampleUpdate,

		// Batch permissions
		PermissionBatchList, PermissionBatchRead,
	},

	OrgRoleAnalyst: {
		// User permissions
		PermissionUserRead,

		// Patient permissions
		PermissionPatientList, PermissionPatientRead,

		// Sample permissions
		PermissionSampleList, PermissionSampleRead, PermissionSampleUpdate,

		// Batch permissions
		PermissionBatchList, PermissionBatchCreate, PermissionBatchRead, PermissionBatchUpdate,
	},

	OrgRoleViewer: {
		// User permissions
		PermissionUserRead,

		// Patient permissions
		PermissionPatientList, PermissionPatientRead,

		// Sample permissions
		PermissionSampleList, PermissionSampleRead,

		// Batch permissions
		PermissionBatchList, PermissionBatchRead,
	},
}

// HasPermission checks if an org role has a specific permission
func (r OrgRole) HasPermission(permissionCode string) bool {
	// Owner and Admin have all permissions
	if r == OrgRoleOwner || r == OrgRoleAdmin {
		return true
	}
	permissions, ok := OrgRolePermissions[r]
	if !ok {
		return false
	}
	for _, p := range permissions {
		if p.Code == permissionCode {
			return true
		}
	}
	return false
}

// GetPermissions returns all permissions for an org role
func (r OrgRole) GetPermissions() []*Permission {
	return OrgRolePermissions[r]
}

// BeforeCreate hook for OrgRolePermission
func (rp *OrgRolePermission) BeforeCreate(tx *gorm.DB) error {
	if rp.ID == uuid.Nil {
		rp.ID = uuid.New()
	}
	return nil
}
