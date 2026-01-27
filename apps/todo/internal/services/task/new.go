package task

import (
	"github.com/dsbasko/back-office.uz/core/logger"
)

type Provider interface {
	Getter
	Finder
}

type Mutator interface {
	Creator
	Checker
}

type Task struct {
	log      *logger.Logger
	provider Provider
	mutator  Mutator
}

type Constructor struct {
	Log      *logger.Logger
	Provider Provider
	Mutator  Mutator
}

func New(opts Constructor) *Task {
	return &Task{
		log:      opts.Log,
		provider: opts.Provider,
		mutator:  opts.Mutator,
	}
}

// Generate mocks for tests.
//go:generate ../../../bin/mockgen -destination=./mocks/provider.go -package=mock_service_task github.com/dsbasko/back-office.uz/apps/todo/internal/services/task Provider
//go:generate ../../../bin/mockgen -destination=./mocks/mutator.go -package=mock_service_task github.com/dsbasko/back-office.uz/apps/todo/internal/services/task Mutator
