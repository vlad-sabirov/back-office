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

func (hs *HandlerSuite) Test_FindTask() {
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
				return testErrMessWrongBodyFormat
			},
		},
		{
			name: "Task Provider Error",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskProvider.EXPECT().
					FindTask(gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{}, hs.parts.err)
			},
			wantStatusCode: http.StatusBadRequest,
			wantBody: func() string {
				return testErrMessFindTask
			},
		},
		{
			name: "Success",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskProvider.EXPECT().
					FindTask(gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{
						ID:          "42",
						UserID:      42,
						Name:        "test name",
						Description: "test description",
					}, nil)
			},
			wantStatusCode: http.StatusOK,
			wantBody: func() string {
				resp, _ := json.Marshal(api.FindTaskResponseV1{
					Data: &entities.RepositoryTaskEntity{
						ID:          "42",
						UserID:      42,
						Name:        "test name",
						Description: "test description",
					},
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
				Path:   "/task/find-task",
				Body:   tt.dto(),
			})
			err := resp.Body.Close()
			assert.NoError(t, err)

			assert.Equal(t, tt.wantStatusCode, resp.StatusCode)
			assert.Equal(t, tt.wantBody(), body)
		})
	}
}

func (hs *HandlerSuite) Test_FindTasks() {
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
				return `{"error":"wrong body format","data":null,"total":0}` + "\n"
			},
		},
		{
			name: "Task Provider Error",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskProvider.EXPECT().
					FindTasks(gomock.Any(), gomock.Any()).
					Return([]entities.RepositoryTaskEntity{}, hs.parts.err)
			},
			wantStatusCode: http.StatusBadRequest,
			wantBody: func() string {
				return `{"error":"failed to find tasks","data":null,"total":0}` + "\n"
			},
		},
		{
			name: "Success",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskProvider.EXPECT().
					FindTasks(gomock.Any(), gomock.Any()).
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
				resp, _ := json.Marshal(api.FindTasksResponseV1{
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
				Path:   "/task/find-tasks",
				Body:   tt.dto(),
			})
			err := resp.Body.Close()
			assert.NoError(t, err)

			assert.Equal(t, tt.wantStatusCode, resp.StatusCode)
			assert.Equal(t, tt.wantBody(), body)
		})
	}
}
