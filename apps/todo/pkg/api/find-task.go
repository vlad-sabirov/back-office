package api

import "github.com/dsbasko/back-office.uz/apps/todo/internal/entities"

/* ----
   Once
   ---- */

type FindTaskRequestV1 struct {
	Fields entities.RepositoryTaskEntity `json:"fields"`
	Order  []order                       `json:"order,omitempty"`
}

type FindTaskResponseV1 struct {
	Error string                         `json:"error,omitempty"`
	Data  *entities.RepositoryTaskEntity `json:"data"`
}

/* ----
   Many
   ---- */

type FindTasksRequestV1 struct {
	Fields entities.RepositoryTaskEntity `json:"fields"`
	Order  []order                       `json:"order,omitempty"`
	Limit  int                           `json:"limit,omitempty"`
	Offset int                           `json:"offset,omitempty"`
}

type FindTasksResponseV1 struct {
	Error string                          `json:"error,omitempty"`
	Data  []entities.RepositoryTaskEntity `json:"data"`
	Total int                             `json:"total"`
}
