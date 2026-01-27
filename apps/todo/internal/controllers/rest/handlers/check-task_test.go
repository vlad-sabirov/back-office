package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
	"github.com/dsbasko/back-office.uz/core/test"
)

func (hs *HandlerSuite) Test_CheckTask() {
	t := hs.T()

	tests := []struct {
		name           string
		dto            func() []byte
		id             string
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
			name: "Task Mutator Error",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskMutator.EXPECT().
					CheckTask(gomock.Any(), gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{}, hs.parts.err)
			},
			wantStatusCode: http.StatusBadRequest,
			wantBody: func() string {
				return testErrMessUpdateTask
			},
		},
		{
			name: "Success",
			dto:  func() []byte { return []byte(`{}`) },
			storageCfg: func() {
				hs.parts.taskMutator.EXPECT().
					CheckTask(gomock.Any(), gomock.Any(), gomock.Any()).
					Return(entities.RepositoryTaskEntity{
						UserID:      42,
						IsDone:      true,
						Name:        "test name",
						Description: "test description",
					}, nil)
			},
			wantStatusCode: http.StatusOK,
			wantBody: func() string {
				resp, _ := json.Marshal(api.CheckTaskResponseV1{
					Data: &entities.RepositoryTaskEntity{
						UserID:      42,
						IsDone:      true,
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
				Method: "PATCH",
				Path:   fmt.Sprintf("/task/%s/check", tt.id),
				Body:   tt.dto(),
			})
			err := resp.Body.Close()
			assert.NoError(t, err)

			assert.Equal(t, tt.wantStatusCode, resp.StatusCode)
			assert.Equal(t, tt.wantBody(), body)
		})
	}
}
