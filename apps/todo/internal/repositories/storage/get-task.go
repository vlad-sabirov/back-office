package storage

import (
	"context"
	"fmt"
	"strings"

	_ "github.com/dsbasko/back-office.uz/apps/todo/docs"
	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

func (r *Storage) GetTasksByUserID(
	ctx context.Context,
	dto api.GetTasksByUserIDRequestV1,
) ([]entities.RepositoryTaskEntity, error) {
	query := strings.Builder{}
	query.WriteString("SELECT * FROM task WHERE user_id = $1 AND is_done = $2")

	if len(dto.Order) > 0 {
		query.WriteString(" ORDER BY ")
		for i, order := range dto.Order {
			if i > 0 {
				query.WriteString(", ")
			}
			query.WriteString(fmt.Sprintf("%s %s", order.Field, order.Direction))
		}
	}

	if dto.Limit != 0 {
		query.WriteString(fmt.Sprintf(" LIMIT %d", dto.Limit))
	}

	if dto.Offset != 0 {
		query.WriteString(fmt.Sprintf(" OFFSET %d", dto.Offset))
	}

	resp := make([]entities.RepositoryTaskEntity, 0)
	rows, err := r.conn.QueryxContext(ctx, query.String(), dto.UserID, dto.IsDone)
	if err != nil {
		return []entities.RepositoryTaskEntity{}, fmt.Errorf("failed to get tasks by user id: %w", err)
	}

	for rows.Next() {
		var task entities.RepositoryTaskEntity
		if err = rows.StructScan(&task); err != nil {
			return []entities.RepositoryTaskEntity{}, fmt.Errorf("failed to scan task: %w", err)
		}

		resp = append(resp, task)
	}

	return resp, nil
}
