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

func (ts *TaskSuite) Test_CheckTask() {
	t := ts.T()

	tests := []struct {
		name       string
		ctx        context.Context
		id         string
		dto        api.CheckTaskRequestV1
		storageCfg func()
		wantResp   entities.RepositoryTaskEntity
		wantErr    error
	}{
		{
			name:       "Missing Arguments (Context)",
			ctx:        nil,
			id:         "",
			dto:        api.CheckTaskRequestV1{},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrMissingArguments,
		},
		{
			name:       "Missing Arguments (Empty ID)",
			ctx:        ts.parts.ctx,
			id:         "",
			dto:        api.CheckTaskRequestV1{},
			storageCfg: func() {},
			wantResp:   entities.RepositoryTaskEntity{},
			wantErr:    ErrMissingArguments,
		},
		{
			name: "Mutator Error",
			ctx:  ts.parts.ctx,
			id:   "42",
			dto: api.CheckTaskRequestV1{
				IsChecked: true,
			},
			storageCfg: func() {
				ts.parts.mutator.EXPECT().
					CheckTask(gomock.Any(), gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{}, ts.parts.err)
			},
			wantResp: entities.RepositoryTaskEntity{},
			wantErr:  ts.parts.err,
		},
		{
			name: "Success",
			ctx:  ts.parts.ctx,
			id:   "42",
			dto: api.CheckTaskRequestV1{
				IsChecked: true,
			},
			storageCfg: func() {
				ts.parts.mutator.EXPECT().
					CheckTask(gomock.Any(), gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{
						UserID:         42,
						Name:           "test name",
						Description:    "test description",
						IsDone:         true,
						OrganizationID: 42,
					}, nil)
			},
			wantResp: entities.RepositoryTaskEntity{
				UserID:         42,
				Name:           "test name",
				Description:    "test description",
				IsDone:         true,
				OrganizationID: 42,
			},
			wantErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.storageCfg()
			gotResp, gotErr := ts.parts.service.CheckTask(tt.ctx, tt.id, tt.dto)
			assert.Equal(t, tt.wantResp, gotResp)
			assert.Equal(t, tt.wantErr, errors.UnwrapAll(gotErr))
		})
	}
}
