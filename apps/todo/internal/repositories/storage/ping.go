package storage

import (
	"context"
	"fmt"
)

func (r *Storage) Ping(ctx context.Context) error {
	if err := r.conn.PingContext(ctx); err != nil {
		return fmt.Errorf("failed to ping the database: %w", err)
	}

	return nil
}
