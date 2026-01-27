package storage

import (
	"context"
	"fmt"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

func (r *Storage) CheckTask(
	ctx context.Context,
	id string,
	dto api.CheckTaskRequestV1,
) (entities.RepositoryTaskEntity, error) {
	var resp entities.RepositoryTaskEntity
	row := r.conn.QueryRowxContext(
		ctx,
		`
			UPDATE task SET is_done = $1
			WHERE id = $2
			RETURNING *
		`,
		dto.IsChecked, id,
	)

	if err := row.StructScan(&resp); err != nil {
		return entities.RepositoryTaskEntity{}, fmt.Errorf("failed to scan response: %w", err)
	}

	return resp, nil
}
