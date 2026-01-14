package dto

// BackupRequest represents a database backup request
type BackupRequest struct {
	OutputPath string `json:"outputPath" binding:"omitempty"` // Optional: custom output path
	Compress   bool   `json:"compress"`                       // Whether to compress the backup
}

// BackupResponse represents a database backup response
type BackupResponse struct {
	BackupID     string `json:"backupId"`
	FilePath     string `json:"filePath"`
	FileSize     int64  `json:"fileSize"`
	DatabaseName string `json:"databaseName"`
	CreatedAt    string `json:"createdAt"`
}

// RestoreRequest represents a database restore request
type RestoreRequest struct {
	BackupFilePath string `json:"backupFilePath" binding:"required"` // Path to the backup file
	DropExisting   bool   `json:"dropExisting"`                     // Drop existing database before restore
}

// RestoreResponse represents a database restore response
type RestoreResponse struct {
	RestoreID   string `json:"restoreId"`
	Status      string `json:"status"`
	Message     string `json:"message"`
	CompletedAt string `json:"completedAt"`
}

// BackupListResponse represents a list of available backups
type BackupListResponse struct {
	Backups     []BackupInfo `json:"backups"`
	TotalCount  int          `json:"totalCount"`
	StorageUsed int64        `json:"storageUsed"`
}

// BackupInfo represents information about a backup file
type BackupInfo struct {
	ID        string `json:"id"`
	FileName  string `json:"fileName"`
	FilePath  string `json:"filePath"`
	FileSize  int64  `json:"fileSize"`
	CreatedAt string `json:"createdAt"`
}
