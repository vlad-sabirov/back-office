package task

import (
	"context"
	"strings"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
	"github.com/dsbasko/back-office.uz/core/errors"
)

func (ts *TaskSuite) Test_CreateTask() {
	t := ts.T()

	tests := []struct {
		name       string
		ctx        context.Context
		dto        api.CreateTaskRequestV1
		storageCfg func()
		wantResp   entities.RepositoryTaskEntity
		wantErr    error
	}{
		{
			name:       "Missing Arguments (Context)",
			ctx:        nil,
			dto:        api.CreateTaskRequestV1{},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrMissingArguments,
		},
		{
			name: "Validation Failed (EmptyUserId)",
			ctx:  ts.parts.ctx,
			dto: api.CreateTaskRequestV1{
				UserID: 0,
				Name:   "test name",
			},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrEmptyUserID,
		},
		{
			name: "Validation Failed (MinLengthName)",
			ctx:  ts.parts.ctx,
			dto: api.CreateTaskRequestV1{
				UserID: 42,
				Name:   "t",
			},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrMinLengthName,
		},
		{
			name: "Validation Failed (MaxLengthName)",
			ctx:  ts.parts.ctx,
			dto: api.CreateTaskRequestV1{
				UserID: 42,
				Name:   strings.Repeat("test name", 42),
			},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrMaxLengthName,
		},
		{
			name: "Validation Failed (MinLengthDescription)",
			ctx:  ts.parts.ctx,
			dto: api.CreateTaskRequestV1{
				UserID:      42,
				Name:        "test name",
				Description: "t",
			},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrMinLengthDesc,
		},
		{
			name: "Validation Failed (OrganizationAndContact)",
			ctx:  ts.parts.ctx,
			dto: api.CreateTaskRequestV1{
				UserID:         42,
				Name:           "test name",
				Description:    "test description",
				OrganizationID: 42,
				ContactID:      42,
			},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrOrganizationAndContact,
		},
		{
			name: "Mutator Error",
			ctx:  ts.parts.ctx,
			dto: api.CreateTaskRequestV1{
				UserID:         42,
				Name:           "test name",
				Description:    "test description",
				OrganizationID: 42,
			},
			storageCfg: func() {
				ts.parts.mutator.EXPECT().
					CreateTask(gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{}, ts.parts.err)
			},
			wantResp: entities.RepositoryTaskEntity{},
			wantErr:  ts.parts.err,
		},
		{
			name: "Success",
			ctx:  ts.parts.ctx,
			dto: api.CreateTaskRequestV1{
				UserID:         42,
				Name:           "test name",
				Description:    "test description",
				OrganizationID: 42,
			},
			storageCfg: func() {
				ts.parts.mutator.EXPECT().
					CreateTask(gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{
						UserID:         42,
						Name:           "test name",
						Description:    "test description",
						OrganizationID: 42,
					}, nil)
			},
			wantResp: entities.RepositoryTaskEntity{
				UserID:         42,
				Name:           "test name",
				Description:    "test description",
				OrganizationID: 42,
			},
			wantErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.storageCfg()
			gotResp, gotErr := ts.parts.service.CreateTask(tt.ctx, tt.dto)
			assert.Equal(t, tt.wantResp, gotResp)
			assert.Equal(t, tt.wantErr, errors.UnwrapAll(gotErr))
		})
	}
}
