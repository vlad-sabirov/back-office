package handlers

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
	"github.com/dsbasko/back-office.uz/core/test"
)

func (hs *HandlerSuite) Test_GetTasksByUserID() {
	t := hs.T()

	tests := []struct {
		name           string
		dto            func() []byte
		storageCfg     func()
		wantBody       func() string
		wantStatusCode int
	}{
		{
			name:           "Wrong Body Format",
			dto:            func() []byte { return []byte(`{!`) },
			storageCfg:     func() {},
			wantStatusCode: http.StatusBadRequest,
			wantBody: func() string {
				return testErrMessWrongBodyFormatWithTotal
			},
		},
		{
			name: "Task Provider Error",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskProvider.EXPECT().
					GetTasksByUserID(gomock.Any(), gomock.Any()).
					Return([]entities.RepositoryTaskEntity{}, hs.parts.err)
			},
			wantStatusCode: http.StatusBadRequest,
			wantBody: func() string {
				return testErrMessFailedGetTasksWithTotal
			},
		},
		{
			name: "Success",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskProvider.EXPECT().
					GetTasksByUserID(gomock.Any(), gomock.Any()).
					Return([]entities.RepositoryTaskEntity{
						{
							UserID:      42,
							Name:        "test name",
							Description: "test description",
						},
					}, nil)
			},
			wantStatusCode: http.StatusOK,
			wantBody: func() string {
				resp, _ := json.Marshal(api.GetTasksResponseV1{
					Data: []entities.RepositoryTaskEntity{
						{
							UserID:      42,
							Name:        "test name",
							Description: "test description",
						},
					},
					Total: 1,
				})
				return string(resp) + "\n"
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.storageCfg()

			resp, body := test.Request(t, hs.parts.ts, &test.RequestArgs{
				Method: "POST",
				Path:   "/task/get-by-user-id",
				Body:   tt.dto(),
			})
			err := resp.Body.Close()
			assert.NoError(t, err)

			assert.Equal(t, tt.wantStatusCode, resp.StatusCode)
			assert.Equal(t, tt.wantBody(), body)
		})
	}
}
