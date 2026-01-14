package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
	"gorm.io/gorm"
)

// StorageSourceService handles storage source operations
type StorageSourceService struct {
	storageSourceRepo *repository.StorageSourceRepository
}

// NewStorageSourceService creates a new storage source service
func NewStorageSourceService(storageSourceRepo *repository.StorageSourceRepository) *StorageSourceService {
	return &StorageSourceService{storageSourceRepo: storageSourceRepo}
}

// CreateStorageSource creates a new storage source
func (s *StorageSourceService) CreateStorageSource(ctx context.Context, req *dto.StorageSourceRequest) (*dto.StorageSourceResponse, error) {
	source := &model.StorageSource{
		Name:        req.Name,
		Protocol:    model.StorageProtocol(req.Protocol),
		Endpoint:    req.Endpoint,
		BasePath:    req.BasePath,
		Credentials: req.Credentials,
		IsDefault:   req.IsDefault,
	}

	if req.IsDefault {
		if err := s.storageSourceRepo.ClearDefault(ctx); err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
	}

	if err := s.storageSourceRepo.Create(ctx, source); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toStorageSourceResponse(source), nil
}

// GetStorageSource retrieves a storage source by ID
func (s *StorageSourceService) GetStorageSource(ctx context.Context, id string) (*dto.StorageSourceResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid storage source ID")
	}

	source, err := s.storageSourceRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("StorageSource")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toStorageSourceResponse(source), nil
}

// GetStorageSources retrieves all storage sources with pagination
func (s *StorageSourceService) GetStorageSources(ctx context.Context, params *dto.PaginatedRequest) (*dto.StorageSourceListResponse, error) {
	sources, total, err := s.storageSourceRepo.GetAll(ctx, params)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.StorageSourceResponse, len(sources))
	for i, source := range sources {
		items[i] = *s.toStorageSourceResponse(&source)
	}

	return toStorageSourcePaginatedResponse(items, total, params), nil
}

// GetDefaultStorageSource retrieves the default storage source
func (s *StorageSourceService) GetDefaultStorageSource(ctx context.Context) (*dto.StorageSourceResponse, error) {
	source, err := s.storageSourceRepo.GetDefault(ctx)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("DefaultStorageSource")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toStorageSourceResponse(source), nil
}

// UpdateStorageSource updates a storage source
func (s *StorageSourceService) UpdateStorageSource(ctx context.Context, id string, req *dto.StorageSourceRequest) (*dto.StorageSourceResponse, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid storage source ID")
	}

	source, err := s.storageSourceRepo.GetByID(ctx, uuid)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("StorageSource")
		}
		return nil, errors.WrapDatabaseError(err)
	}

	if req.IsDefault && !source.IsDefault {
		if err := s.storageSourceRepo.ClearDefault(ctx); err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
	}

	if req.Name != "" {
		source.Name = req.Name
	}
	if req.Protocol != "" {
		source.Protocol = model.StorageProtocol(req.Protocol)
	}
	if req.Endpoint != "" {
		source.Endpoint = req.Endpoint
	}
	if req.BasePath != "" {
		source.BasePath = req.BasePath
	}
	if req.Credentials != "" {
		source.Credentials = req.Credentials
	}
	source.IsDefault = req.IsDefault

	if err := s.storageSourceRepo.Update(ctx, source); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toStorageSourceResponse(source), nil
}

// DeleteStorageSource deletes a storage source
func (s *StorageSourceService) DeleteStorageSource(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return errors.NewValidationError("Invalid storage source ID")
	}

	exists, err := s.storageSourceRepo.Exists(ctx, uuid)
	if err != nil {
		return errors.WrapDatabaseError(err)
	}
	if !exists {
		return errors.NewNotFoundError("StorageSource")
	}

	if err := s.storageSourceRepo.Delete(ctx, uuid); err != nil {
		return errors.WrapDatabaseError(err)
	}

	return nil
}

// toStorageSourceResponse converts a storage source model to a response DTO
func (s *StorageSourceService) toStorageSourceResponse(source *model.StorageSource) *dto.StorageSourceResponse {
	return &dto.StorageSourceResponse{
		ID:        source.ID.String(),
		Name:      source.Name,
		Protocol:  string(source.Protocol),
		Endpoint:  source.Endpoint,
		BasePath:  source.BasePath,
		IsDefault: source.IsDefault,
		CreatedAt: source.CreatedAt,
		UpdatedAt: source.UpdatedAt,
	}
}

// toStorageSourcePaginatedResponse creates a paginated response for storage sources
func toStorageSourcePaginatedResponse(items []dto.StorageSourceResponse, total int64, params *dto.PaginatedRequest) *dto.StorageSourceListResponse {
	page := params.GetPage()
	pageSize := params.GetPageSize()
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &dto.StorageSourceListResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
