//go:build e2e

package e2e

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
	"github.com/stretchr/testify/assert"
)

func (s *SandboxTestSuite) Test_Task() {
	fmt.Println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

	s.createTask(api.CreateTaskRequestV1{
		UserID:      1,
		Name:        "test name",
		Description: "test description",
		DueDate:     time.Now(),
	}, api.CreateTaskResponseV1{
		Data: &entities.RepositoryTaskEntity{
			UserID:      1,
			Name:        "test name",
			Description: "test description",
			DueDate:     time.Now(),
		},
		Error: "",
	}, http.StatusCreated)

	fmt.Println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
}

func (s *SandboxTestSuite) createTask(
	dto api.CreateTaskRequestV1,
	wantResponse api.CreateTaskResponseV1,
	wantCode int,
) {
	t := s.T()
	resp, err := s.client.R().SetBody(dto).Post("/task")

	assert.NoError(t, err)
	assert.Equal(t, wantCode, resp.StatusCode())
	assert.EqualValues(t, wantResponse, resp.Result())
}
