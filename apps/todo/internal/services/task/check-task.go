package task

import (
	"context"
	"fmt"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type Checker interface {
	CheckTask(ctx context.Context, id string, dto api.CheckTaskRequestV1) (resp entities.RepositoryTaskEntity, err error)
}

func (t *Task) CheckTask(
	ctx context.Context,
	id string,
	dto api.CheckTaskRequestV1,
) (entities.RepositoryTaskEntity, error) {
	if ctx == nil || id == "" {
		return entities.RepositoryTaskEntity{}, ErrMissingArguments
	}

	respRepo, err := t.mutator.CheckTask(ctx, id, dto)
	if err != nil {
		return entities.RepositoryTaskEntity{}, fmt.Errorf("repo.CheckTask: %w", err)
	}

	return respRepo, nil
}
