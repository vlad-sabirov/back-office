package api

import "github.com/dsbasko/back-office.uz/apps/todo/internal/entities"

type GetTasksByUserIDRequestV1 struct {
	UserID int     `json:"user_id"`
	IsDone bool    `json:"is_done,omitempty"`
	Order  []order `json:"order,omitempty"`
	Limit  int     `json:"limit,omitempty"`
	Offset int     `json:"offset,omitempty"`
}

type GetTasksResponseV1 struct {
	Error string                          `json:"error,omitempty"`
	Data  []entities.RepositoryTaskEntity `json:"data"`
	Total int                             `json:"total"`
}
