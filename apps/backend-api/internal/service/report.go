package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"schema-platform/apps/backend-api/internal/model"
	"schema-platform/apps/backend-api/internal/repository"
)

// ReportService handles business logic for reports
type ReportService struct {
	repo *repository.ReportRepository
}

// NewReportService creates a new report service
func NewReportService(repo *repository.ReportRepository) *ReportService {
	return &ReportService{repo: repo}
}

// CreateReport creates a new report
func (s *ReportService) CreateReport(ctx context.Context, orgID, taskID, userID uuid.UUID, title string, templateID *uuid.UUID) (*model.Report, error) {
	report := &model.Report{
		OrgID:       orgID,
		TaskID:      taskID,
		TemplateID:  templateID,
		Title:       title,
		Status:      model.ReportStatusDraft,
		ReportType:  "generated",
		CreatedBy:   userID,
	}

	if err := s.repo.Create(ctx, report); err != nil {
		return nil, fmt.Errorf("failed to create report: %w", err)
	}

	return report, nil
}

// UploadReport creates a report from an uploaded file
func (s *ReportService) UploadReport(ctx context.Context, orgID, taskID, userID uuid.UUID, title, filePath, fileName, fileType string) (*model.Report, error) {
	report := &model.Report{
		OrgID:      orgID,
		TaskID:     taskID,
		Title:      title,
		Status:     model.ReportStatusDraft,
		FilePath:   filePath,
		FileName:   fileName,
		FileType:   fileType,
		ReportType: "uploaded",
		CreatedBy:  userID,
	}

	if err := s.repo.Create(ctx, report); err != nil {
		return nil, fmt.Errorf("failed to create uploaded report: %w", err)
	}

	return report, nil
}

// GetReport retrieves a report by ID
func (s *ReportService) GetReport(ctx context.Context, id uuid.UUID) (*model.Report, error) {
	return s.repo.GetByID(ctx, id)
}

// GetTaskReports retrieves all reports for a task
func (s *ReportService) GetTaskReports(ctx context.Context, taskID uuid.UUID) ([]model.Report, error) {
	return s.repo.GetByTaskID(ctx, taskID)
}

// GetOrgReports retrieves all reports for an organization with optional status filter
func (s *ReportService) GetOrgReports(ctx context.Context, orgID uuid.UUID, status *model.ReportStatus) ([]model.Report, error) {
	return s.repo.GetByOrgID(ctx, orgID, status)
}

// UpdateReportStatus transitions a report to a new status
func (s *ReportService) UpdateReportStatus(ctx context.Context, id uuid.UUID, newStatus model.ReportStatus, userID uuid.UUID) error {
	report, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get report: %w", err)
	}

	// Validate status transition
	if !report.Status.CanTransitionTo(newStatus) {
		return errors.New("invalid status transition")
	}

	// Only authorized users can perform certain transitions
	// TODO: Add permission checks based on organization roles

	if err := s.repo.UpdateStatus(ctx, id, newStatus, userID); err != nil {
		return fmt.Errorf("failed to update report status: %w", err)
	}

	return nil
}

// DeleteReport deletes a report
func (s *ReportService) DeleteReport(ctx context.Context, id uuid.UUID) error {
	report, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get report: %w", err)
	}

	// Cannot delete released reports
	if report.Status == model.ReportStatusReleased {
		return errors.New("cannot delete released reports")
	}

	return s.repo.Delete(ctx, id)
}

// GetTemplates retrieves all active report templates
func (s *ReportService) GetTemplates(ctx context.Context, orgID uuid.UUID) ([]model.ReportTemplate, error) {
	return s.repo.GetTemplates(ctx, orgID)
}

// SubmitForReview transitions a draft report to pending review
func (s *ReportService) SubmitForReview(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.UpdateReportStatus(ctx, id, model.ReportStatusPendingReview, userID)
}

// ApproveReport transitions a pending review report to approved
func (s *ReportService) ApproveReport(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.UpdateReportStatus(ctx, id, model.ReportStatusApproved, userID)
}

// ReleaseReport transitions an approved report to released
func (s *ReportService) ReleaseReport(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.UpdateReportStatus(ctx, id, model.ReportStatusReleased, userID)
}

// RejectReport transitions a pending review report back to draft
func (s *ReportService) RejectReport(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	return s.UpdateReportStatus(ctx, id, model.ReportStatusDraft, userID)
}