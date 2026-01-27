package storage

import (
	"context"
	"fmt"
	"strings"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/structs"
)

func (r *Storage) FindTasks(
	ctx context.Context,
	dto api.FindTasksRequestV1,
) (
	resp []entities.RepositoryTaskEntity,
	err error,
) {
	keys, values, err := structs.ToKeysAndValues(dto.Fields, true, nil)
	if err != nil {
		return []entities.RepositoryTaskEntity{}, fmt.Errorf("failed to convert struct to keys and values: %w", err)
	}

	var queryWhere []string
	for i, key := range keys {
		queryWhere = append(queryWhere, fmt.Sprintf("%s = $%d", key, i+1))
	}

	query := strings.Builder{}
	query.WriteString(fmt.Sprintf("SELECT * FROM task WHERE %s", strings.Join(queryWhere, " AND ")))

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

	rows, err := r.conn.QueryxContext(ctx, query.String(), values...)
	if err != nil {
		return []entities.RepositoryTaskEntity{}, fmt.Errorf("failed to find tasks: %w", err)
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
