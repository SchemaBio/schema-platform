# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Build arguments
ARG ANALYSIS_TYPE=somatic

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Set build-time environment variable for config generation
ENV ANALYSIS_TYPE=$ANALYSIS_TYPE

# Generate config.yaml based on ANALYSIS_TYPE
RUN if [ "$ANALYSIS_TYPE" = "germline" ]; then \
      sed 's/type: "somatic"/type: "germline"/' config.example.yaml > config.yaml; \
    else \
      cp config.example.yaml config.yaml; \
    fi

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o schema-platform-backend ./cmd/server

# Final stage
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates and PostgreSQL client tools
RUN apk --no-cache add ca-certificates tzdata postgresql-client

# Copy binary from builder
COPY --from=builder /app/schema-platform-backend .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/config.yaml ./config.yaml

# Create non-root user
RUN adduser -D -g '' appuser
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run
CMD ["./schema-platform-backend"]
