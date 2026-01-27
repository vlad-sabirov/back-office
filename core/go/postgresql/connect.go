package postgresql

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	MaxConns     int32
	MaxRetries   int
	RetryTimeOut time.Duration
}

func Connect(ctx context.Context, dsn string, options Config) (*pgxpool.Pool, error) {
	switch {
	case options.MaxConns == 0:
		return nil, ErrMaxConnsNotFilled
	case options.MaxRetries == 0:
		return nil, ErrMaxRetriesNotFilled
	case options.RetryTimeOut == 0:
		return nil, ErrRetryTimeOutNotFilled
	default:
	}

	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.ParseConfig: %w", err)
	}

	cfg.MaxConns = options.MaxConns

	connect, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.NewWithConfig: %w", err)
	}

	for i := 0; i < options.MaxRetries; i++ {
		if err = connect.Ping(ctx); err != nil {
			if err == nil {
				break
			} else if i == options.MaxRetries-1 {
				return nil, fmt.Errorf("conn.Ping: %w", err)
			}
			time.Sleep(options.RetryTimeOut)
		}
	}

	return connect, nil
}
