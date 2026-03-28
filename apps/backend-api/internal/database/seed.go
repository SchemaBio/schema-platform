package database

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/config"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/pkg/hash"
	"github.com/schema-platform/backend-api/internal/repository"
	"gorm.io/gorm"
)

// SeedDefaultOrganization creates the default organization if it doesn't exist
func SeedDefaultOrganization(db *gorm.DB, tenantCfg *config.TenantConfig) (*model.Organization, error) {
	ctx := context.Background()

	// Check if default organization exists
	var org model.Organization
	err := db.WithContext(ctx).Where("slug = ?", tenantCfg.DefaultOrgSlug).First(&org).Error
	if err == nil {
		log.Printf("Default organization %s already exists", tenantCfg.DefaultOrgSlug)
		return &org, nil
	}

	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create default organization
	org = model.Organization{
		Name:        "Default Organization",
		Slug:        tenantCfg.DefaultOrgSlug,
		Description: "Default organization for single-tenant deployment",
		Status:      model.OrgStatusActive,
		Plan:        model.OrgPlanSelfHosted,
		MaxUsers:    -1, // unlimited
		Settings:    model.OrgSettings{},
	}

	if err := db.WithContext(ctx).Create(&org).Error; err != nil {
		log.Printf("Failed to create default organization: %v", err)
		return nil, err
	}

	log.Printf("Default organization created: %s", org.Name)
	return &org, nil
}

// SeedDefaultAdmin creates the default admin user if it doesn't exist
func SeedDefaultAdmin(db *gorm.DB, cfg *config.AdminConfig, tenantCfg *config.TenantConfig, defaultOrg *model.Organization) error {
	if !cfg.Enabled {
		log.Println("Admin user creation is disabled in config")
		return nil
	}

	if cfg.Email == "" || cfg.Password == "" {
		log.Println("Admin email or password not configured, skipping admin creation")
		return nil
	}

	userRepo := repository.NewUserRepository(db)

	// Check if admin already exists
	ctx := context.Background()
	exists, err := userRepo.ExistsByEmail(ctx, cfg.Email)
	if err != nil {
		return err
	}

	if exists {
		log.Printf("Admin user %s already exists", cfg.Email)
		return nil
	}

	// Create admin user
	passwordHash, err := hash.HashPassword(cfg.Password)
	if err != nil {
		log.Printf("Failed to hash admin password: %v", err)
		return err
	}

	admin := &model.User{
		Email:        cfg.Email,
		Name:         cfg.Name,
		PasswordHash: passwordHash,
		SystemRole:   model.SystemRoleSuperAdmin,
		PrimaryOrgID: &defaultOrg.ID,
		IsActive:     true,
	}

	if err := userRepo.Create(ctx, admin); err != nil {
		log.Printf("Failed to create admin user: %v", err)
		return err
	}

	// Add admin to default organization as OWNER
	orgMember := &model.OrgMember{
		UserID:  admin.ID,
		OrgID:   defaultOrg.ID,
		OrgRole: model.OrgRoleOwner,
	}

	if err := db.WithContext(ctx).Create(orgMember).Error; err != nil {
		log.Printf("Failed to add admin to default organization: %v", err)
		return err
	}

	log.Printf("Default admin user created: %s", cfg.Email)
	return nil
}

// SeedPermissions seeds all permissions into the database
func SeedPermissions(db *gorm.DB) error {
	permissions := model.AllPermissions()

	ctx := context.Background()

	for _, perm := range permissions {
		// Check if permission already exists
		var count int64
		err := db.WithContext(ctx).Model(&model.Permission{}).Where("code = ?", perm.Code).Count(&count).Error
		if err != nil {
			return err
		}

		if count == 0 {
			// Create permission
			if err := db.WithContext(ctx).Create(perm).Error; err != nil {
				log.Printf("Failed to create permission %s: %v", perm.Code, err)
				return err
			}
			log.Printf("Created permission: %s", perm.Code)
		}
	}

	log.Println("Permissions seeded successfully")
	return nil
}

// SeedOrgRolePermissions seeds org role-permission associations
func SeedOrgRolePermissions(db *gorm.DB) error {
	ctx := context.Background()

	roles := []model.OrgRole{
		model.OrgRoleOwner,
		model.OrgRoleAdmin,
		model.OrgRoleDoctor,
		model.OrgRoleAnalyst,
		model.OrgRoleViewer,
	}

	for _, role := range roles {
		permissions := role.GetPermissions()
		if permissions == nil {
			continue
		}

		for _, perm := range permissions {
			// Get permission ID
			var permModel model.Permission
			if err := db.WithContext(ctx).Where("code = ?", perm.Code).First(&permModel).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					continue
				}
				return err
			}

			// Check if role-permission already exists
			var count int64
			err := db.WithContext(ctx).Model(&model.OrgRolePermission{}).
				Where("org_role = ? AND permission_id = ?", role, permModel.ID).
				Count(&count).Error
			if err != nil {
				return err
			}

			if count == 0 {
				// Create role-permission
				rp := &model.OrgRolePermission{
					OrgRole:      role,
					PermissionID: permModel.ID,
				}
				if err := db.WithContext(ctx).Create(rp).Error; err != nil {
					log.Printf("Failed to create org role-permission for %s: %v", role, err)
					return err
				}
			}
		}
	}

	log.Println("Org role permissions seeded successfully")
	return nil
}

// SeedAll runs all database seeding
func SeedAll(db *gorm.DB, adminCfg *config.AdminConfig, tenantCfg *config.TenantConfig) error {
	log.Println("Starting database seeding...")

	// Seed default organization
	defaultOrg, err := SeedDefaultOrganization(db, tenantCfg)
	if err != nil {
		return err
	}

	// Seed permissions
	if err := SeedPermissions(db); err != nil {
		return err
	}

	// Seed org role permissions
	if err := SeedOrgRolePermissions(db); err != nil {
		return err
	}

	// Seed admin user
	if err := SeedDefaultAdmin(db, adminCfg, tenantCfg, defaultOrg); err != nil {
		return err
	}

	log.Println("Database seeding completed")
	return nil
}

// GetDefaultOrgID returns the default organization ID
func GetDefaultOrgID(db *gorm.DB, tenantCfg *config.TenantConfig) (uuid.UUID, error) {
	ctx := context.Background()
	var org model.Organization
	err := db.WithContext(ctx).Where("slug = ?", tenantCfg.DefaultOrgSlug).First(&org).Error
	if err != nil {
		return uuid.Nil, err
	}
	return org.ID, nil
}