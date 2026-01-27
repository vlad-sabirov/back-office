package main

import (
	"context"
	goLog "log"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/app"
	"github.com/dsbasko/back-office.uz/apps/todo/internal/config"
	"github.com/dsbasko/back-office.uz/core/logger"
)

// @title           Todo Microservice
// @version         1.0
// @description     Планировщик задач.
// @termsOfService  http://swagger.io/terms/

// @contact.name   Dmitriy Basenko
// @contact.url    https://github.com/dsbasko
// @contact.email  d.basenko.it@gmail.com

// @host      localhost
// @BasePath  /api/todo

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := config.Init(); err != nil {
		goLog.Panicf("config.Init: %s", err)
	}

	log, err := logger.NewLogger(config.Env(), config.ServiceName())
	if err != nil {
		goLog.Panicf("logger.NewLogger: %s", err)
	}

	if err := app.RunTODO(ctx, log); err != nil {
		goLog.Panicf("app.Run: %s", err)
	}
}
