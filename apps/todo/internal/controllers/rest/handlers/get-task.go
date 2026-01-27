package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type TaskGetter interface {
	GetTasksByUserID(ctx context.Context, dto api.GetTasksByUserIDRequestV1) ([]entities.RepositoryTaskEntity, error)
}

// GetTasksByUserID godoc
// @Summary			Получить задачи по ID пользователя
// @Description	Ищет задачи по ID пользователя с возможностью фильтрации
// @Tags				tasks
// @Accept			json
// @Produce			json
// @Param			task body api.GetTasksByUserIDRequestV1 true "DTO поиска задачи"
// @Success			201 {object} api.GetTasksResponseV1 "Успешный ответ"
// @Failure			400 {object} api.GetTasksResponseV1 "Какая-то ошибка"
// @Failure			500 {object} api.GetTasksResponseV1 "Ошибка сервисного слоя"
// @Router			/task/get-tasks-by-user-id [post]
func (h *Handlers) GetTasksByUserID(w http.ResponseWriter, r *http.Request) {
	log := h.log.With("request_id", middleware.GetReqID(r.Context()))

	var dto api.GetTasksByUserIDRequestV1
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to decode request body: %w", err),
			http.StatusBadRequest,
			api.GetTasksResponseV1{Error: "wrong body format"},
		)
		return
	}

	foundTasks, err := h.taskProvider.GetTasksByUserID(r.Context(), dto)
	if err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to get tasks from service layer: %w", err),
			http.StatusBadRequest,
			api.GetTasksResponseV1{Error: "failed to get tasks"},
		)
		return
	}

	sendResponse(
		log, w, nil,
		http.StatusOK,
		api.GetTasksResponseV1{
			Data:  foundTasks,
			Total: len(foundTasks),
		},
	)
}
