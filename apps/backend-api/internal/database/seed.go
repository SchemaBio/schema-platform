package database

import (
	"context"
	"log"

	"github.com/schema-platform/backend-api/internal/config"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/pkg/hash"
	"github.com/schema-platform/backend-api/internal/repository"
	"gorm.io/gorm"
)

// SeedDefaultAdmin creates the default admin user if it doesn't exist
func SeedDefaultAdmin(db *gorm.DB, cfg *config.AdminConfig) error {
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
		Role:         model.UserRoleAdmin,
		IsActive:     true,
	}

	if err := userRepo.Create(ctx, admin); err != nil {
		log.Printf("Failed to create admin user: %v", err)
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

// SeedRolePermissions seeds role-permission associations
func SeedRolePermissions(db *gorm.DB) error {
	ctx := context.Background()

	roles := []model.UserRole{
		model.UserRoleAdmin,
		model.UserRoleDoctor,
		model.UserRoleAnalyst,
		model.UserRoleViewer,
	}

	for _, role := range roles {
		permissions := role.GetPermissions()

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
			err := db.WithContext(ctx).Model(&model.RolePermission{}).
				Where("role = ? AND permission_id = ?", role, permModel.ID).
				Count(&count).Error
			if err != nil {
				return err
			}

			if count == 0 {
				// Create role-permission
				rp := &model.RolePermission{
					Role:         role,
					PermissionID: permModel.ID,
				}
				if err := db.WithContext(ctx).Create(rp).Error; err != nil {
					log.Printf("Failed to create role-permission for %s: %v", role, err)
					return err
				}
			}
		}
	}

	log.Println("Role permissions seeded successfully")
	return nil
}

// SeedAll runs all database seeding
func SeedAll(db *gorm.DB, adminCfg *config.AdminConfig) error {
	log.Println("Starting database seeding...")

	// Seed permissions
	if err := SeedPermissions(db); err != nil {
		return err
	}

	// Seed role permissions
	if err := SeedRolePermissions(db); err != nil {
		return err
	}

	// Seed admin user
	if err := SeedDefaultAdmin(db, adminCfg); err != nil {
		return err
	}

	log.Println("Database seeding completed")
	return nil
}
