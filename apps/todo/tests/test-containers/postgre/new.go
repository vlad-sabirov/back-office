package postgre

import (
	"context"
	"database/sql"
	"path"
	"time"

	"github.com/pressly/goose/v3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/dsbasko/back-office.uz/apps/todo/pkg/errors"
)

const (
	withStartupTimeout = 5 * time.Second
)

type PostgresContainer struct {
	*postgres.PostgresContainer
	DSN string
}

type Options struct {
	Login string
	Pass  string
	DB    string
}

func New(ctx context.Context, opts Options) (resp *PostgresContainer, err error) {
	defer errors.ErrorPtrWithOP(&err, "tests.test-containers.postgre.New")

	container, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("postgres:15.4-alpine3.17"),
		postgres.WithDatabase(opts.DB),
		postgres.WithUsername(opts.Login),
		postgres.WithPassword(opts.Pass),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(withStartupTimeout),
		),
	)
	if err != nil {
		return nil, errors.ErrorWithOP(err, "(testcontainers) postgres.RunContainer")
	}

	dsn, err := container.ConnectionString(ctx)
	if err != nil {
		return nil, errors.ErrorWithOP(err, "(testcontainers) container.ConnectionString")
	}

	if err := migrations(dsn); err != nil {
		errors.ErrorPtrWithOP(&err, "migrations")
		return nil, err
	}

	return &PostgresContainer{
		PostgresContainer: container,
		DSN:               dsn,
	}, nil
}

func migrations(dsn string) error {
	if err := goose.SetDialect("postgres"); err != nil {
		return errors.ErrorWithOP(err, "goose.SetDialect")
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return errors.ErrorWithOP(err, "sql.Open")
	}

	if err := goose.Up(db, path.Join("../", "../", "migrations")); err != nil {
		return errors.ErrorWithOP(err, "goose.Up")
	}

	return nil
}
