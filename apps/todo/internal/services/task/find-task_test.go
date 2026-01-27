package task

import (
	"context"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
	"github.com/dsbasko/back-office.uz/core/errors"
)

func (ts *TaskSuite) Test_FindOnce() {
	t := ts.T()

	tests := []struct {
		name       string
		ctx        context.Context
		dto        api.FindTaskRequestV1
		storageCfg func()
		wantResp   entities.RepositoryTaskEntity
		wantErr    error
	}{
		{
			name:       "Missing Arguments (Context)",
			ctx:        nil,
			dto:        api.FindTaskRequestV1{},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrMissingArguments,
		},
		{
			name: "Provider Error",
			ctx:  ts.parts.ctx,
			dto: api.FindTaskRequestV1{
				Fields: entities.RepositoryTaskEntity{
					Name: "test name",
				},
			},
			storageCfg: func() {
				ts.parts.provider.EXPECT().
					FindTask(gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{}, ts.parts.err)
			},
			wantResp: entities.RepositoryTaskEntity{},
			wantErr:  ts.parts.err,
		},

		{
			name: "Success",
			ctx:  ts.parts.ctx,
			dto: api.FindTaskRequestV1{
				Fields: entities.RepositoryTaskEntity{
					Name: "test name",
				},
			},
			storageCfg: func() {
				ts.parts.provider.EXPECT().
					FindTask(gomock.Any(), gomock.Any()).
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
			gotResp, gotErr := ts.parts.service.FindTask(tt.ctx, tt.dto)
			assert.Equal(t, tt.wantResp, gotResp)
			assert.Equal(t, tt.wantErr, errors.UnwrapAll(gotErr))
		})
	}
}

func (ts *TaskSuite) Test_FindMany() {
	t := ts.T()

	tests := []struct {
		name       string
		ctx        context.Context
		dto        api.FindTasksRequestV1
		storageCfg func()
		wantResp   []entities.RepositoryTaskEntity
		wantErr    error
	}{
		{
			name:       "Missing Arguments (Context)",
			ctx:        nil,
			dto:        api.FindTasksRequestV1{},
			storageCfg: func() {},
			wantResp:   []entities.RepositoryTaskEntity{},
			wantErr:    ErrMissingArguments,
		},
		{
			name: "Provider Error",
			ctx:  ts.parts.ctx,
			dto: api.FindTasksRequestV1{
				Fields: entities.RepositoryTaskEntity{
					Name: "test name",
				},
			},
			storageCfg: func() {
				ts.parts.provider.EXPECT().
					FindTasks(gomock.Any(), gomock.Any()).
					Return([]entities.RepositoryTaskEntity{}, ts.parts.err)
			},
			wantResp: []entities.RepositoryTaskEntity{},
			wantErr:  ts.parts.err,
		},

		{
			name: "Success",
			ctx:  ts.parts.ctx,
			dto: api.FindTasksRequestV1{
				Fields: entities.RepositoryTaskEntity{
					Name: "test name",
				},
			},
			storageCfg: func() {
				ts.parts.provider.EXPECT().
					FindTasks(gomock.Any(), gomock.Any()).
					Return([]entities.RepositoryTaskEntity{
						{
							UserID:         42,
							Name:           "test name",
							Description:    "test description",
							OrganizationID: 42,
						},
					}, nil)
			},
			wantResp: []entities.RepositoryTaskEntity{
				{
					UserID:         42,
					Name:           "test name",
					Description:    "test description",
					OrganizationID: 42,
				},
			},
			wantErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.storageCfg()
			gotResp, gotErr := ts.parts.service.FindTasks(tt.ctx, tt.dto)
			assert.Equal(t, tt.wantResp, gotResp)
			assert.Equal(t, tt.wantErr, errors.UnwrapAll(gotErr))
		})
	}
}
