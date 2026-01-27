package storage

import (
	"context"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/config"
	"github.com/dsbasko/back-office.uz/core/logger"
)

type Storage struct {
	log  *logger.Logger
	conn *sqlx.DB
}

func New(ctx context.Context, log *logger.Logger) (*Storage, error) {
	conn, err := sqlx.ConnectContext(ctx, "pgx", config.PsqlConnectingString())
	if err != nil {
		return nil, fmt.Errorf("failed to connect to the database: %w", err)
	}

	conn.SetMaxOpenConns(config.PsqlMaxPools())

	log.Infof("postgresql storage initialized")

	return &Storage{
		log:  log,
		conn: conn,
	}, nil
}
