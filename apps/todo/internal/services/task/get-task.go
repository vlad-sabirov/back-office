package task

import (
	"context"
	"fmt"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type Getter interface {
	GetTasksByUserID(ctx context.Context, dto api.GetTasksByUserIDRequestV1) ([]entities.RepositoryTaskEntity, error)
}

func (t *Task) GetTasksByUserID(
	ctx context.Context,
	dto api.GetTasksByUserIDRequestV1,
) ([]entities.RepositoryTaskEntity, error) {
	if ctx == nil {
		return []entities.RepositoryTaskEntity{}, ErrMissingArguments
	}

	if dto.UserID <= 0 {
		return []entities.RepositoryTaskEntity{}, ErrEmptyUserID
	}

	if dto.Limit == 0 {
		dto.Limit = 100
	}

	respRepo, err := t.provider.GetTasksByUserID(ctx, dto)
	if err != nil {
		return []entities.RepositoryTaskEntity{}, fmt.Errorf("repo.GetTasksByUserID: %w", err)
	}

	return respRepo, nil
}
