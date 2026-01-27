package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/dsbasko/back-office.uz/core/logger"

	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type Sender interface {
	api.CreateTaskResponseV1 |
		api.GetTasksResponseV1 |
		api.FindTaskResponseV1 | api.FindTasksResponseV1 |
		api.CheckTaskResponseV1
}

func sendResponse[T Sender](
	log *logger.Logger,
	w http.ResponseWriter,
	logError error,
	statusCode int,
	resp T,
) {
	if logError != nil {
		log.Errorf("handlers error: %s", logError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Errorf("failed to encode response body: %v", err)
	}
}
