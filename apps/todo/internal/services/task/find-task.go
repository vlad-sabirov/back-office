package task

import (
	"context"
	"fmt"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type Finder interface {
	FindTask(ctx context.Context, dto api.FindTaskRequestV1) (entities.RepositoryTaskEntity, error)
	FindTasks(ctx context.Context, dto api.FindTasksRequestV1) ([]entities.RepositoryTaskEntity, error)
}

func (t *Task) FindTask(
	ctx context.Context,
	dto api.FindTaskRequestV1,
) (resp entities.RepositoryTaskEntity, err error) {
	if ctx == nil {
		return entities.RepositoryTaskEntity{}, ErrMissingArguments
	}

	respRepo, err := t.provider.FindTask(ctx, dto)
	if err != nil {
		return entities.RepositoryTaskEntity{}, fmt.Errorf("failed to find task from repository: %w", err)
	}

	return respRepo, nil
}

func (t *Task) FindTasks(
	ctx context.Context,
	dto api.FindTasksRequestV1,
) (resp []entities.RepositoryTaskEntity, err error) {
	if ctx == nil {
		return []entities.RepositoryTaskEntity{}, ErrMissingArguments
	}

	if dto.Limit == 0 {
		dto.Limit = 100
	}

	respRepo, err := t.provider.FindTasks(ctx, dto)
	if err != nil {
		return []entities.RepositoryTaskEntity{}, fmt.Errorf("failed to find task from repository: %w", err)
	}

	return respRepo, nil
}
