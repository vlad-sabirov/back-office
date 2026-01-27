package api

import (
	"time"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
)

type CreateTaskRequestV1 struct {
	UserID                     int       `json:"user_id"`
	Name                       string    `json:"name"`
	Description                string    `json:"description"`
	DueDate                    time.Time `json:"due_date"`
	AssigneeID                 int       `json:"assignee_id"`
	OrganizationID             int       `json:"organization_id"`
	ContactID                  int       `json:"contact_id"`
	SendNotificationToTelegram bool      `json:"send_notification_to_telegram"`
}

type CreateTaskResponseV1 struct {
	Error string                         `json:"error,omitempty"`
	Data  *entities.RepositoryTaskEntity `json:"data"`
}
