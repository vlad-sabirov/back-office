package storage

import (
	"context"
	"fmt"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

func (r *Storage) CreateTask(
	ctx context.Context,
	dto api.CreateTaskRequestV1,
) (entities.RepositoryTaskEntity, error) {
	var resp entities.RepositoryTaskEntity
	row := r.conn.QueryRowxContext(
		ctx,
		`
			INSERT INTO task (user_id, name, description, due_date, assignee_id, organization_id, contact_id, send_notification_to_telegram)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING *
		`,
		dto.UserID, dto.Name, dto.Description, dto.DueDate, dto.AssigneeID, dto.OrganizationID, dto.ContactID, dto.SendNotificationToTelegram,
	)

	if err := row.StructScan(&resp); err != nil {
		return entities.RepositoryTaskEntity{}, fmt.Errorf("failed to scan response: %w", err)
	}

	return resp, nil
}
