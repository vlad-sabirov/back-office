package task

import (
	"context"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/config"
	mockServiceTask "github.com/dsbasko/back-office.uz/apps/todo/internal/services/task/mocks"
	"github.com/dsbasko/back-office.uz/core/logger"
)

type TaskSuite struct {
	*suite.Suite

	parts struct {
		log      *logger.Logger
		provider *mockServiceTask.MockProvider
		mutator  *mockServiceTask.MockMutator
		service  *Task
		ctx      context.Context
		err      error
	}
}

func (ts *TaskSuite) SetupSuite() {
	config.MustInit()
	t := ts.T()
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	ts.parts.log = logger.NewMock()
	ts.parts.provider = mockServiceTask.NewMockProvider(ctrl)
	ts.parts.mutator = mockServiceTask.NewMockMutator(ctrl)
	ts.parts.service = New(Constructor{
		Log:      ts.parts.log,
		Provider: ts.parts.provider,
		Mutator:  ts.parts.mutator,
	})

	ts.parts.ctx = context.Background()
	ts.parts.err = errors.New("some error")
}

func (ts *TaskSuite) Test_New() {
	t := ts.T()

	t.Run("Success", func(t *testing.T) {
		mockService := &Task{
			log:      ts.parts.log,
			provider: ts.parts.provider,
			mutator:  ts.parts.mutator,
		}

		assert.NotNil(t, ts.parts.service)
		assert.EqualExportedValues(t, *mockService, *ts.parts.service)
	})
}

func Test_Service_Task(t *testing.T) {
	suite.Run(t, &TaskSuite{Suite: new(suite.Suite)})
}
