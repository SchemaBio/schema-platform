package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/schema-platform/backend-api/internal/dto"
	"github.com/schema-platform/backend-api/internal/model"
	"github.com/schema-platform/backend-api/internal/repository"
	"github.com/schema-platform/backend-api/pkg/errors"
)

// PedigreeService handles pedigree operations
type PedigreeService struct {
	pedigreeRepo *repository.PedigreeRepository
	memberRepo   *repository.PedigreeMemberRepository
	sampleRepo   *repository.SampleRepository
}

// NewPedigreeService creates a new pedigree service
func NewPedigreeService(pedigreeRepo *repository.PedigreeRepository, memberRepo *repository.PedigreeMemberRepository, sampleRepo *repository.SampleRepository) *PedigreeService {
	return &PedigreeService{
		pedigreeRepo: pedigreeRepo,
		memberRepo:   memberRepo,
		sampleRepo:   sampleRepo,
	}
}

// CreatePedigree creates a new pedigree
func (s *PedigreeService) CreatePedigree(ctx context.Context, req *dto.PedigreeCreateRequest) (*dto.PedigreeResponse, error) {
	// Check if name exists
	exists, err := s.pedigreeRepo.ExistsByName(ctx, req.Name)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}
	if exists {
		return nil, errors.NewConflictError("Pedigree name already exists")
	}

	pedigree := &model.Pedigree{
		Name:    req.Name,
		Disease: req.Disease,
		Note:    req.Note,
	}

	if err := s.pedigreeRepo.Create(ctx, pedigree); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPedigreeResponse(pedigree), nil
}

// GetPedigree retrieves a pedigree by ID
func (s *PedigreeService) GetPedigree(ctx context.Context, id string) (*dto.PedigreeDetailResponse, error) {
	pedigreeID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid pedigree ID")
	}

	pedigree, err := s.pedigreeRepo.GetByID(ctx, pedigreeID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPedigreeDetailResponse(pedigree), nil
}

// ListPedigrees lists all pedigrees
func (s *PedigreeService) ListPedigrees(ctx context.Context, page, pageSize int) (*dto.PaginatedResponse[dto.PedigreeResponse], error) {
	offset := (page - 1) * pageSize
	pedigrees, total, err := s.pedigreeRepo.List(ctx, pageSize, offset)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.PedigreeResponse, len(pedigrees))
	for i, p := range pedigrees {
		items[i] = *s.toPedigreeResponse(&p)
	}

	return dto.NewPaginatedResponse(items, total, page, pageSize), nil
}

// UpdatePedigree updates a pedigree
func (s *PedigreeService) UpdatePedigree(ctx context.Context, id string, req *dto.PedigreeUpdateRequest) (*dto.PedigreeResponse, error) {
	pedigreeID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.NewValidationError("Invalid pedigree ID")
	}

	pedigree, err := s.pedigreeRepo.GetByID(ctx, pedigreeID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	if req.Name != nil && *req.Name != pedigree.Name {
		exists, err := s.pedigreeRepo.ExistsByName(ctx, *req.Name)
		if err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
		if exists {
			return nil, errors.NewConflictError("Pedigree name already exists")
		}
		pedigree.Name = *req.Name
	}

	if req.Disease != nil {
		pedigree.Disease = *req.Disease
	}
	if req.Note != nil {
		pedigree.Note = *req.Note
	}

	if err := s.pedigreeRepo.Update(ctx, pedigree); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toPedigreeResponse(pedigree), nil
}

// DeletePedigree deletes a pedigree
func (s *PedigreeService) DeletePedigree(ctx context.Context, id string) error {
	pedigreeID, err := uuid.Parse(id)
	if err != nil {
		return errors.NewValidationError("Invalid pedigree ID")
	}

	return s.pedigreeRepo.Delete(ctx, pedigreeID)
}

// AddMember adds a member to a pedigree
func (s *PedigreeService) AddMember(ctx context.Context, pedigreeID string, req *dto.PedigreeMemberCreateRequest) (*dto.PedigreeMemberResponse, error) {
	parsedID, err := uuid.Parse(pedigreeID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid pedigree ID")
	}

	pedigree, err := s.pedigreeRepo.GetByID(ctx, parsedID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	member := &model.PedigreeMember{
		PedigreeID:     pedigree.ID,
		Name:           req.Name,
		Gender:         req.Gender,
		BirthYear:      req.BirthYear,
		IsDeceased:     req.IsDeceased,
		DeceasedYear:   req.DeceasedYear,
		Relation:       model.RelationType(req.Relation),
		AffectedStatus: model.AffectedStatus(req.AffectedStatus),
		Phenotypes:     req.Phenotypes,
		FatherID:       req.FatherID,
		MotherID:       req.MotherID,
		Generation:     req.Generation,
		Position:       req.Position,
	}

	if req.SampleID != nil {
		sampleUUID, err := uuid.Parse(*req.SampleID)
		if err != nil {
			return nil, errors.NewValidationError("Invalid sample ID")
		}
		member.SampleID = &sampleUUID
	}

	if err := s.memberRepo.Create(ctx, member); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// If this is the proband, update the pedigree
	if req.Relation == "proband" {
		pedigree.ProbandMemberID = &member.ID
		if err := s.pedigreeRepo.Update(ctx, pedigree); err != nil {
			return nil, errors.WrapDatabaseError(err)
		}
	}

	return s.toMemberResponse(member), nil
}

// GetMembers retrieves all members of a pedigree
func (s *PedigreeService) GetMembers(ctx context.Context, pedigreeID string) ([]dto.PedigreeMemberResponse, error) {
	parsedID, err := uuid.Parse(pedigreeID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid pedigree ID")
	}

	members, err := s.memberRepo.GetByPedigreeID(ctx, parsedID)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	items := make([]dto.PedigreeMemberResponse, len(members))
	for i, m := range members {
		items[i] = *s.toMemberResponse(&m)
	}

	return items, nil
}

// UpdateMember updates a pedigree member
func (s *PedigreeService) UpdateMember(ctx context.Context, memberID string, req *dto.PedigreeMemberUpdateRequest) (*dto.PedigreeMemberResponse, error) {
	memberIDParsed, err := uuid.Parse(memberID)
	if err != nil {
		return nil, errors.NewValidationError("Invalid member ID")
	}

	member, err := s.memberRepo.GetByID(ctx, memberIDParsed)
	if err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	// Update fields
	if req.Name != nil {
		member.Name = *req.Name
	}
	if req.Gender != nil {
		member.Gender = *req.Gender
	}
	if req.BirthYear != nil {
		member.BirthYear = req.BirthYear
	}
	if req.IsDeceased != nil {
		member.IsDeceased = *req.IsDeceased
	}
	if req.DeceasedYear != nil {
		member.DeceasedYear = req.DeceasedYear
	}
	if req.Relation != nil {
		member.Relation = model.RelationType(*req.Relation)
	}
	if req.AffectedStatus != nil {
		member.AffectedStatus = model.AffectedStatus(*req.AffectedStatus)
	}
	if req.Phenotypes != nil {
		member.Phenotypes = *req.Phenotypes
	}
	if req.FatherID != nil {
		member.FatherID = req.FatherID
	}
	if req.MotherID != nil {
		member.MotherID = req.MotherID
	}
	if req.Generation != nil {
		member.Generation = *req.Generation
	}
	if req.Position != nil {
		member.Position = *req.Position
	}
	if req.SampleID != nil {
		member.SampleID = req.SampleID
	}

	if err := s.memberRepo.Update(ctx, member); err != nil {
		return nil, errors.WrapDatabaseError(err)
	}

	return s.toMemberResponse(member), nil
}

// DeleteMember deletes a pedigree member
func (s *PedigreeService) DeleteMember(ctx context.Context, memberID string) error {
	memberIDParsed, err := uuid.Parse(memberID)
	if err != nil {
		return errors.NewValidationError("Invalid member ID")
	}

	return s.memberRepo.Delete(ctx, memberIDParsed)
}

// toPedigreeResponse converts a model to DTO
func (s *PedigreeService) toPedigreeResponse(p *model.Pedigree) *dto.PedigreeResponse {
	return &dto.PedigreeResponse{
		ID:          p.ID.String(),
		Name:        p.Name,
		Disease:     p.Disease,
		MemberCount: len(p.Members),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

// toPedigreeDetailResponse converts a model to detailed DTO
func (s *PedigreeService) toPedigreeDetailResponse(p *model.Pedigree) *dto.PedigreeDetailResponse {
	members := make([]dto.PedigreeMemberResponse, len(p.Members))
	for i, m := range p.Members {
		members[i] = *s.toMemberResponse(&m)
	}

	return &dto.PedigreeDetailResponse{
		ID:              p.ID.String(),
		Name:            p.Name,
		Disease:         p.Disease,
		Note:            p.Note,
		ProbandMemberID: p.ProbandMemberID,
		Members:         members,
		CreatedAt:       p.CreatedAt,
		UpdatedAt:       p.UpdatedAt,
	}
}

// toMemberResponse converts a member model to DTO
func (s *PedigreeService) toMemberResponse(m *model.PedigreeMember) *dto.PedigreeMemberResponse {
	return &dto.PedigreeMemberResponse{
		ID:             m.ID.String(),
		PedigreeID:     m.PedigreeID.String(),
		SampleID:       m.SampleID,
		Name:           m.Name,
		Gender:         m.Gender,
		BirthYear:      m.BirthYear,
		IsDeceased:     m.IsDeceased,
		DeceasedYear:   m.DeceasedYear,
		Relation:       string(m.Relation),
		AffectedStatus: string(m.AffectedStatus),
		Phenotypes:     m.Phenotypes,
		FatherID:       m.FatherID,
		MotherID:       m.MotherID,
		Generation:     m.Generation,
		Position:       m.Position,
		HasSample:      m.SampleID != nil,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}
