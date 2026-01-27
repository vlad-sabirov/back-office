package entities

import "time"

type RepositoryTaskEntity struct {
	ID                         string    `json:"id" db:"id"`
	IsDone                     bool      `json:"is_done" db:"is_done"`
	UserID                     int       `json:"user_id" db:"user_id"`
	Name                       string    `json:"name" db:"name"`
	Description                string    `json:"description" db:"description"`
	DueDate                    time.Time `json:"due_date" db:"due_date"`
	AssigneeID                 int       `json:"assignee_id" db:"assignee_id"`
	OrganizationID             int       `json:"organization_id" db:"organization_id"`
	ContactID                  int       `json:"contact_id" db:"contact_id"`
	SendNotificationToTelegram bool      `json:"send_notification_to_telegram" db:"send_notification_to_telegram"`
	CreatedAt                  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt                  time.Time `json:"updated_at" db:"updated_at"`
}
