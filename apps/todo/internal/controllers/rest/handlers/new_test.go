package handlers

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/config"
	mockCRH "github.com/dsbasko/back-office.uz/apps/todo/internal/controllers/rest/handlers/mocks"
	"github.com/dsbasko/back-office.uz/core/logger"
)

type HandlerSuite struct {
	*suite.Suite

	parts struct {
		log          *logger.Logger
		pinger       *mockCRH.MockPinger
		taskProvider *mockCRH.MockTaskProvider
		taskMutator  *mockCRH.MockTaskMutator
		handlers     *Handlers
		ts           *httptest.Server
		ctx          context.Context
		err          error
	}
}

func (hs *HandlerSuite) SetupSuite() {
	t := hs.T()
	config.MustInit()
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	hs.parts.log = logger.NewMock()
	hs.parts.pinger = mockCRH.NewMockPinger(ctrl)
	hs.parts.taskProvider = mockCRH.NewMockTaskProvider(ctrl)
	hs.parts.taskMutator = mockCRH.NewMockTaskMutator(ctrl)

	router := chi.NewRouter()
	hs.parts.handlers = New(Constructor{
		Log:          hs.parts.log,
		Pinger:       hs.parts.pinger,
		TaskProvider: hs.parts.taskProvider,
		TaskMutator:  hs.parts.taskMutator,
	})
	router.Get("/ping", hs.parts.handlers.Ping)
	router.Post("/task", hs.parts.handlers.CreateTask)
	router.Post("/task/find-task", hs.parts.handlers.FindTask)
	router.Post("/task/find-tasks", hs.parts.handlers.FindTasks)
	router.Post("/task/get-by-user-id", hs.parts.handlers.GetTasksByUserID)
	router.Patch("/task/{task_id}/check", hs.parts.handlers.CheckTask)
	hs.parts.ts = httptest.NewServer(router)

	hs.parts.ctx = context.Background()
	hs.parts.err = errors.New("some error")
}

func (hs *HandlerSuite) TearDownSuite() {
	hs.parts.ts.Close()
}

func (hs *HandlerSuite) Test_New() {
	t := hs.T()

	t.Run("Success", func(t *testing.T) {
		mockHandlers := &Handlers{
			log:          hs.parts.log,
			pinger:       hs.parts.pinger,
			taskProvider: hs.parts.taskProvider,
			taskMutator:  hs.parts.taskMutator,
		}

		assert.NotNil(t, hs.parts.handlers)
		assert.EqualExportedValues(t, *mockHandlers, *hs.parts.handlers)
	})
}

func Test_Controller_REST_Handlers(t *testing.T) {
	suite.Run(t, &HandlerSuite{Suite: new(suite.Suite)})
}
