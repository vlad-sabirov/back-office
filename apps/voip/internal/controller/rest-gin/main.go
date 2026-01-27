package restgin

import (
	_ "github.com/dsbasko/back-office.uz/tree/main/apps/voip/docs"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/controller/rest-gin/middlewares"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/config"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/elastic-crm"
	"github.com/gin-gonic/gin"
	"github.com/swaggo/files"
	"github.com/swaggo/gin-swagger"
	"go.uber.org/zap"
	"strings"
)

type HTTPServer struct {
	log     *logger.Logger
	command command.Command
	elastic *elasticcrm.ElasticCRM
	Events  *Events
}

func New(log *logger.Logger, command command.Command, elastic *elasticcrm.ElasticCRM) HTTPServer {
	return HTTPServer{
		log:     log,
		command: command,
		Events:  NewEvents(log),
		elastic: elastic,
	}
}

type customWriter struct {
	logger *zap.SugaredLogger
}

func (w *customWriter) Write(msg []byte) (n int, err error) {
	msgString := string(msg)
	msgString = strings.TrimSuffix(msgString, "\n")
	w.logger.Debug(msgString)
	return 0, nil
}

func (h HTTPServer) Run() error {
	if config.GetEnv() == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	gin.DefaultWriter = &customWriter{h.log}
	server := gin.New()
	err := server.SetTrustedProxies(nil)
	if err != nil {
		return err
	}

	// middleware
	server.Use(gin.Recovery())
	server.Use(middlewares.Logs(h.log))

	// routes
	if config.GetEnv() != "production" {
		server.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}
	server.GET("/ping", h.handlePing)
	server.GET("/events/", h.Events.handleEvents)
	server.GET("/search/:phone", middlewares.BasicAuth(h.log), h.handleSearch)

	server.POST("/p2p/create", h.handleP2PCreate)
	server.PATCH("/p2p/redirect", h.handleP2PRedirect)
	server.POST("/conference/create", h.handleConferenceCreate)
	server.PATCH("/conference/add", h.handleConferenceAdd)
	server.PATCH("/call/mic", h.handleCallMic)
	server.PATCH("/call/hangup", h.handleCallHangup)
	server.PUT("/call/morph-p2p-to-conference", h.handleCallMorphP2PToConference)
	server.POST("/analytics", h.handleAnalytics)
	server.POST("/analytics/missing", h.handleMissedCalls)
	server.PATCH("/analytics/missing/check", h.handleMissedCallsCheck)
	server.POST("/analytics/recording", h.handleRecordings)

	return server.Run(":" + config.GetPort())
}
