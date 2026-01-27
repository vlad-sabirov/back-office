package logger

import (
	"fmt"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func New() (*Logger, error) {
	var logger *zap.SugaredLogger

	if config.GetEnv() == "production" {
		encoderCfg := zap.NewProductionEncoderConfig()
		encoderCfg.TimeKey = "timestamp"
		encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
		encoderCfg.EncodeLevel = zapcore.LowercaseLevelEncoder

		config := zap.Config{
			Level:         zap.NewAtomicLevelAt(zap.InfoLevel),
			Development:   false,
			Encoding:      "json",
			EncoderConfig: encoderCfg,
			OutputPaths: []string{
				"stdout",
			},
			ErrorOutputPaths: []string{
				"stderr",
			},
			InitialFields: map[string]interface{}{
				"service": "url-shortener",
			},
		}
		zap, err := config.Build()
		if err != nil {
			return nil, err
		}
		logger = zap.Sugar()
	} else {
		encoderCfg := zap.NewDevelopmentEncoderConfig()
		encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
		encoderCfg.EncodeLevel = zapcore.CapitalColorLevelEncoder

		config := zap.Config{
			Level:         zap.NewAtomicLevelAt(zap.DebugLevel),
			Development:   true,
			Encoding:      "console",
			EncoderConfig: encoderCfg,
			OutputPaths: []string{
				"stdout",
			},
			ErrorOutputPaths: []string{
				"stderr",
			},
		}
		zap, err := config.Build()
		if err != nil {
			return nil, err
		}
		logger = zap.Sugar()
	}
	defer func() {
		err := logger.Sync()
		if err != nil {
			fmt.Println(err.Error())
		}
	}()

	return logger, nil
}
