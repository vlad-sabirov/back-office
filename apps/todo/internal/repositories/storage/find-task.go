package storage

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/structs"
)

func (r *Storage) FindTask(
	ctx context.Context,
	dto api.FindTaskRequestV1,
) (
	resp entities.RepositoryTaskEntity,
	err error,
) {
	keys, values, err := structs.ToKeysAndValues(dto.Fields, true, nil)
	if err != nil {
		return entities.RepositoryTaskEntity{}, fmt.Errorf("failed to convert struct to keys and values: %w", err)
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

	query.WriteString(" LIMIT 1")

	rows := r.conn.QueryRowxContext(ctx, query.String(), values...)
	if err != nil {
		return entities.RepositoryTaskEntity{}, fmt.Errorf("failed to find task: %w", err)
	}

	var task entities.RepositoryTaskEntity
	if err = rows.StructScan(&task); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return entities.RepositoryTaskEntity{}, nil
		}
		return entities.RepositoryTaskEntity{}, fmt.Errorf("failed to scan task: %w", err)
	}

	return task, nil
}
