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

type TaskFinder interface {
	FindTask(ctx context.Context, dto api.FindTaskRequestV1) (entities.RepositoryTaskEntity, error)
	FindTasks(ctx context.Context, dto api.FindTasksRequestV1) ([]entities.RepositoryTaskEntity, error)
}

// FindTask godoc
// @Summary			Поиск задачи
// @Description	Ищет задачу по переданным параметрам
// @Tags				tasks
// @Accept			json
// @Produce			json
// @Param			task body api.FindTaskRequestV1 true "DTO поиска задачи"
// @Success			201 {object} api.FindTaskResponseV1 "Успешный поиск"
// @Failure			400 {object} api.FindTaskResponseV1 "Какая-то ошибка"
// @Failure			500 {object} api.FindTaskResponseV1 "Ошибка сервисного слоя"
// @Router			/task/find-task [post]
func (h *Handlers) FindTask(w http.ResponseWriter, r *http.Request) {
	log := h.log.With("request_id", middleware.GetReqID(r.Context()))

	var dto api.FindTaskRequestV1
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to decode request body: %w", err),
			http.StatusBadRequest,
			api.FindTaskResponseV1{Error: "wrong body format"},
		)
		return
	}

	foundTask, err := h.taskProvider.FindTask(r.Context(), dto)
	if err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to find task from service layer: %w", err),
			http.StatusBadRequest,
			api.FindTaskResponseV1{Error: "failed to find task"},
		)
		return
	}

	if foundTask.ID == "" {
		sendResponse(
			log, w, nil,
			http.StatusOK,
			api.FindTaskResponseV1{},
		)
		return
	}

	sendResponse(
		log, w, nil,
		http.StatusOK,
		api.FindTaskResponseV1{Data: &foundTask},
	)
}

// FindTasks godoc
// @Summary			Поиск задач
// @Description	Ищет задачи по переданным параметрам
// @Tags				tasks
// @Accept			json
// @Produce			json
// @Param			task body api.FindTasksRequestV1 true "DTO поиска задачи"
// @Success			201 {object} api.FindTasksResponseV1 "Успешный поиск"
// @Failure			400 {object} api.FindTasksResponseV1 "Какая-то ошибка"
// @Failure			500 {object} api.FindTasksResponseV1 "Ошибка сервисного слоя"
// @Router			/task/find-tasks [post]
func (h *Handlers) FindTasks(w http.ResponseWriter, r *http.Request) {
	log := h.log.With("request_id", middleware.GetReqID(r.Context()))

	var dto api.FindTasksRequestV1
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to decode request body: %w", err),
			http.StatusBadRequest,
			api.FindTasksResponseV1{Error: "wrong body format"},
		)
		return
	}

	foundTasks, err := h.taskProvider.FindTasks(r.Context(), dto)
	if err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to find tasks from service layer: %w", err),
			http.StatusBadRequest,
			api.FindTasksResponseV1{Error: "failed to find tasks"},
		)
		return
	}

	sendResponse(
		log, w, nil,
		http.StatusOK,
		api.FindTasksResponseV1{
			Data:  foundTasks,
			Total: len(foundTasks),
		},
	)
}
