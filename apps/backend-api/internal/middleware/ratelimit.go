package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/schema-platform/backend-api/internal/pkg/response"
)

// RateLimiter implements a token bucket rate limiter
type RateLimiter struct {
	mu              sync.Mutex
	buckets         map[string]*bucket
	rate            float64 // tokens per second
	burst           int     // maximum tokens
	cleanupInterval time.Duration
}

type bucket struct {
	tokens     float64
	lastUpdate time.Time
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(rate float64, burst int) *RateLimiter {
	rl := &RateLimiter{
		buckets:         make(map[string]*bucket),
		rate:            rate,
		burst:           burst,
		cleanupInterval: 10 * time.Minute,
	}
	
	// Start cleanup goroutine
	go rl.cleanup()
	
	return rl
}

// Allow checks if a request is allowed for the given key
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	b, exists := rl.buckets[key]
	
	if !exists {
		rl.buckets[key] = &bucket{
			tokens:     float64(rl.burst) - 1,
			lastUpdate: now,
		}
		return true
	}

	// Calculate tokens to add based on time elapsed
	elapsed := now.Sub(b.lastUpdate).Seconds()
	b.tokens += elapsed * rl.rate
	
	// Cap tokens at burst limit
	if b.tokens > float64(rl.burst) {
		b.tokens = float64(rl.burst)
	}
	
	b.lastUpdate = now

	// Check if we have tokens available
	if b.tokens >= 1 {
		b.tokens--
		return true
	}

	return false
}

// cleanup removes old buckets periodically
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(rl.cleanupInterval)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, b := range rl.buckets {
			// Remove buckets that haven't been used for a while
			if now.Sub(b.lastUpdate) > rl.cleanupInterval {
				delete(rl.buckets, key)
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimit creates a rate limiting middleware
func RateLimit(rate float64, burst int) gin.HandlerFunc {
	limiter := NewRateLimiter(rate, burst)
	
	return func(c *gin.Context) {
		// Use client IP as the rate limit key
		key := c.ClientIP()
		
		if !limiter.Allow(key) {
			response.TooManyRequests(c)
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// RateLimitWithLimiter creates a rate limiting middleware with a custom limiter
func RateLimitWithLimiter(limiter *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Use client IP as the rate limit key
		key := c.ClientIP()
		
		if !limiter.Allow(key) {
			response.TooManyRequests(c)
			c.Abort()
			return
		}
		
		c.Next()
	}
}
