package middleware

import "github.com/dsbasko/back-office.uz/core/logger"

type Middleware struct {
	log *logger.Logger
}

func New(log *logger.Logger) Middleware {
	return Middleware{log: log}
}
