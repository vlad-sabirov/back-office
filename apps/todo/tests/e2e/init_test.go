//go:build e2e

package e2e

import (
	"context"
	"log"
	"testing"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/stretchr/testify/suite"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/app"
	"github.com/dsbasko/back-office.uz/apps/todo/internal/config"
	"github.com/dsbasko/back-office.uz/apps/todo/tests/test-containers/postgre"
	"github.com/dsbasko/back-office.uz/core/logger"
)

type SandboxTestSuite struct {
	suite.Suite
	pgContainer *postgre.PostgresContainer
	ctx         context.Context
	client      *resty.Client
}

func (s *SandboxTestSuite) SetupSuite() {
	s.ctx = context.Background()

	container, err := postgre.New(s.ctx, postgre.Options{
		Login: "test",
		Pass:  "test",
		DB:    "test",
	})
	if err != nil {
		log.Fatal(err)
	}
	s.pgContainer = container

	config.MustInit()
	config.SetPsqlConnectingString(s.pgContainer.DSN)

	client := resty.New()
	client.SetBaseURL("http://localhost:3000")
	s.client = client

	go func() {
		if err = app.RunTODO(s.ctx, logger.NewMock()); err != nil {
			log.Fatal(err)
		}
	}()

	time.Sleep(5 * time.Second)
}

func (s *SandboxTestSuite) TearDownSuite() {
	if err := s.pgContainer.Terminate(s.ctx); err != nil {
		log.Fatalf("error terminating postgres container. Error: %s\n", err)
	}

	_, cancel := context.WithCancel(s.ctx)
	cancel()
}

func TestE2E(t *testing.T) {
	suite.Run(t, new(SandboxTestSuite))
}
