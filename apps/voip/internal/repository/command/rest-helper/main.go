package resthelper

import (
	"fmt"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/config"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"github.com/go-resty/resty/v2"
)

type HelperREST struct {
	log    *logger.Logger
	client *resty.Client
}

var _ command.Command = (*HelperREST)(nil)

func New(log *logger.Logger) command.Command {
	client := resty.New().
		SetBasicAuth(config.GetHelperUsername(), config.GetHelperPassword()).
		SetBaseURL(fmt.Sprintf("http://%v:%v/", config.GetHelperHost(), config.GetHelperPort()))
	return &HelperREST{
		log:    log,
		client: client,
	}
}
