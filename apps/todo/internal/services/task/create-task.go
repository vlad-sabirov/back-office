package task

import (
	"context"
	"fmt"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type Creator interface {
	CreateTask(ctx context.Context, dto api.CreateTaskRequestV1) (resp entities.RepositoryTaskEntity, err error)
}

func (t *Task) CreateTask(
	ctx context.Context,
	dto api.CreateTaskRequestV1,
) (entities.RepositoryTaskEntity, error) {
	if ctx == nil || dto == (api.CreateTaskRequestV1{}) {
		return entities.RepositoryTaskEntity{}, ErrMissingArguments
	}

	switch {
	case dto.UserID <= 0:
		return entities.RepositoryTaskEntity{}, ErrEmptyUserID
	case len(dto.Name) < MinLengthName:
		return entities.RepositoryTaskEntity{}, ErrMinLengthName
	case len(dto.Name) > MaxLengthName:
		return entities.RepositoryTaskEntity{}, ErrMaxLengthName
	case dto.Description != "" && len(dto.Description) < MinLengthDescription:
		return entities.RepositoryTaskEntity{}, ErrMinLengthDesc
	case dto.OrganizationID != 0 && dto.ContactID != 0:
		return entities.RepositoryTaskEntity{}, ErrOrganizationAndContact
	}

	respRepo, err := t.mutator.CreateTask(ctx, dto)
	if err != nil {
		return entities.RepositoryTaskEntity{}, fmt.Errorf("repo.CreateTask: %w", err)
	}

	return respRepo, nil
}
