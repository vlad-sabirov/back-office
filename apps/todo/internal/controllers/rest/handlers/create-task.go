package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	mwChi "github.com/go-chi/chi/v5/middleware"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type TaskCreator interface {
	CreateTask(ctx context.Context, dto api.CreateTaskRequestV1) (resp entities.RepositoryTaskEntity, err error)
}

// CreateTask godoc
// @Summary			Создание новой задачи
// @Description	Принимает данные задачи и создает новую задачу
// @Tags				tasks
// @Accept			json
// @Produce			json
// @Param			task body api.CreateTaskRequestV1 true "DTO для создания задачи"
// @Success			201 {object} api.CreateTaskResponseV1 "Успешное создание задачи"
// @Failure			400 {object} api.CreateTaskResponseV1 "Какая-то ошибка"
// @Router			/task [post]
func (h *Handlers) CreateTask(w http.ResponseWriter, r *http.Request) {
	log := h.log.With("request_id", mwChi.GetReqID(r.Context()))

	var dto api.CreateTaskRequestV1
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to decode request body: %w", err),
			http.StatusBadRequest,
			api.CreateTaskResponseV1{Error: "wrong body format"},
		)
		return
	}

	createdTask, err := h.taskMutator.CreateTask(r.Context(), dto)
	if err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to create task from service layer: %w", err),
			http.StatusBadRequest,
			api.CreateTaskResponseV1{Error: "failed to create task"},
		)
		return
	}

	sendResponse(
		log, w, nil,
		http.StatusCreated,
		api.CreateTaskResponseV1{Data: &createdTask},
	)
}
