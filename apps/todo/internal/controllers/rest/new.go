package rest

import (
	"context"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	mwChi "github.com/go-chi/chi/v5/middleware"
	httpSwagger "github.com/swaggo/http-swagger/v2"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/config"
	"github.com/dsbasko/back-office.uz/apps/todo/internal/controllers/rest/handlers"
	"github.com/dsbasko/back-office.uz/apps/todo/internal/controllers/rest/middlewares"
	"github.com/dsbasko/back-office.uz/core/logger"
)

type Constructor struct {
	CTX          context.Context
	Log          *logger.Logger
	Pinger       handlers.Pinger
	TaskProvider handlers.TaskProvider
	TaskMutator  handlers.TaskMutator
}

func New(opts Constructor) error {
	router := chi.NewRouter()

	mw := middlewares.New(opts.Log)
	router.Use(mwChi.RequestID)
	router.Use(mwChi.Recoverer)
	router.Use(mw.CompressDecoding)
	router.Use(mw.Logger)
	router.Use(mw.RequestID)
	router.Use(mw.CompressEncoding)

	h := handlers.New(handlers.Constructor{
		Log:          opts.Log,
		Pinger:       opts.Pinger,
		TaskProvider: opts.TaskProvider,
		TaskMutator:  opts.TaskMutator,
	})
	router.Get("/ping", h.Ping)
	router.Post("/task", h.CreateTask)
	router.Post("/task/find-task", h.FindTask)
	router.Post("/task/find-tasks", h.FindTasks)
	router.Post("/task/get-tasks-by-user-id", h.GetTasksByUserID)
	router.Patch("/task/{task_id}/check", h.CheckTask)

	if config.Env() != "production" {
		router.Mount("/docs", httpSwagger.WrapHandler)
	}

	routes := router.Routes()
	for _, route := range routes {
		if strings.Contains(route.Pattern, "/docs") {
			continue
		}

		for handle := range route.Handlers {
			opts.Log.Debugf("mapped [%v] %v route", handle, route.Pattern)
		}
	}

	server := http.Server{
		Addr:         ":3000",
		Handler:      router,
		ReadTimeout:  config.RestReadTimeout(),
		WriteTimeout: config.RestWriteTimeout(),
	}

	go func() {
		<-opts.CTX.Done()
		opts.Log.Info("shutdown rest server")
		err := server.Shutdown(context.Background())
		if err != nil {
			opts.Log.Errorf("a signal has been received to terminate the http server: %v", err)
		}
	}()

	opts.Log.Infof("starting rest server...")
	return server.ListenAndServe()
}
