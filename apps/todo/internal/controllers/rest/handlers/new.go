package handlers

import (
	"github.com/dsbasko/back-office.uz/core/logger"
)

type TaskProvider interface {
	TaskGetter
	TaskFinder
}

type TaskMutator interface {
	TaskCreator
	TaskChecker
}

type Handlers struct {
	log          *logger.Logger
	pinger       Pinger
	taskProvider TaskProvider
	taskMutator  TaskMutator
}

type Constructor struct {
	Log          *logger.Logger
	Pinger       Pinger
	TaskProvider TaskProvider
	TaskMutator  TaskMutator
}

func New(opts Constructor) *Handlers {
	return &Handlers{
		log:          opts.Log,
		pinger:       opts.Pinger,
		taskProvider: opts.TaskProvider,
		taskMutator:  opts.TaskMutator,
	}
}

// Generate mocks for tests.
//go:generate ../../../../bin/mockgen -destination=./mocks/pinger.go -package=mock_controller_rest_handlers github.com/dsbasko/back-office.uz/apps/todo/internal/controllers/rest/handlers Pinger
//go:generate ../../../../bin/mockgen -destination=./mocks/task-provider.go -package=mock_controller_rest_handlers github.com/dsbasko/back-office.uz/apps/todo/internal/controllers/rest/handlers TaskProvider
//go:generate ../../../../bin/mockgen -destination=./mocks/task-mutator.go -package=mock_controller_rest_handlers github.com/dsbasko/back-office.uz/apps/todo/internal/controllers/rest/handlers TaskMutator
