package api

import (
	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
)

type CheckTaskRequestV1 struct {
	IsChecked bool `json:"is_checked"`
}

type CheckTaskResponseV1 struct {
	Error string                         `json:"error,omitempty"`
	Data  *entities.RepositoryTaskEntity `json:"data"`
}
