package app

import (
	"context"
	"fmt"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/controllers/rest"
	"github.com/dsbasko/back-office.uz/apps/todo/internal/repositories/storage"
	"github.com/dsbasko/back-office.uz/apps/todo/internal/services/task"
	"github.com/dsbasko/back-office.uz/core/logger"
)

func RunTODO(ctx context.Context, log *logger.Logger) error {
	storagePsql, err := storage.New(ctx, log)
	if err != nil {
		return fmt.Errorf("repositories.New: %w", err)
	}

	taskService := task.New(task.Constructor{
		Log:      log,
		Provider: storagePsql,
		Mutator:  storagePsql,
	})

	if err = rest.New(rest.Constructor{
		CTX:          ctx,
		Log:          log,
		Pinger:       storagePsql,
		TaskProvider: taskService,
		TaskMutator:  taskService,
	}); err != nil {
		return fmt.Errorf("rest.RunController: %w", err)
	}

	return nil
}
