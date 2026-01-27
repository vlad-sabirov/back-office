package logger

import (
	"go.uber.org/zap"
)

type Logger = zap.SugaredLogger

type zapLogger struct {
	logger *zap.Logger
}
