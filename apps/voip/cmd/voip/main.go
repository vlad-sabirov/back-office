package main

import (
	restgin "github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/controller/rest-gin"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/config"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command/rest-helper"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/elastic-crm"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/helper-events"
	goLog "log"
)

//	@title		Voip
//	@version	1.0

//	@contact.name	Dmitriy Basenko
//	@contact.url	https://github.com/dsbasko/
//	@contact.email	d.basenko.it@gmail.com

//	@host		localhost
//	@BasePath	/api/voip

//	@securityDefinitions.basic	BasicAuth

func main() {
	err := run()
	if err != nil {
		goLog.Fatal(err)
	}
}

func run() error {
	err := config.MustLoad()
	if err != nil {
		return err
	}

	log, err := logger.New()
	if err != nil {
		return err
	}

	elasticCrm, err := elasticcrm.New(log)
	if err != nil {
		return err
	}

	command := resthelper.New(log)
	httpServer := restgin.New(log, command, elasticCrm)
	helperEvents := helperevents.New(log, command, httpServer.Events, elasticCrm)

	go helperEvents.Run()
	err = httpServer.Run()
	if err != nil {
		return err
	}

	return nil
}
