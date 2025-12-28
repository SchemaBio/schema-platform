package hash

import (
	"golang.org/x/crypto/bcrypt"
)

const (
	// DefaultCost is the default bcrypt cost
	DefaultCost = 12
)

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// VerifyPassword verifies a password against a hash
func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// IsHashed checks if a string looks like a bcrypt hash
func IsHashed(s string) bool {
	// bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
	if len(s) != 60 {
		return false
	}
	if s[0] != '$' || s[1] != '2' {
		return false
	}
	return true
}
