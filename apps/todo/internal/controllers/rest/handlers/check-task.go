package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	mwChi "github.com/go-chi/chi/v5/middleware"

	"github.com/dsbasko/back-office.uz/apps/todo/internal/entities"
	"github.com/dsbasko/back-office.uz/apps/todo/pkg/api"
)

type TaskChecker interface {
	CheckTask(ctx context.Context, id string, dto api.CheckTaskRequestV1) (resp entities.RepositoryTaskEntity, err error)
}

// CheckTask godoc
// @Summary			Пометка задачи как выполненной
// @Description		Помечает задачу выполненной или невыполненной
// @Tags			tasks
// @Accept			json
// @Produce			json
// @Param			task body api.CheckTaskRequestV1 true "DTO для пометки задачи"
// @Success			200 {object} api.CheckTaskResponseV1 "Успешная пометка задачи"
// @Failure			400 {object} api.CheckTaskResponseV1 "Какая-то ошибка"
// @Router			/task/{task_id}/check [patch]
func (h *Handlers) CheckTask(w http.ResponseWriter, r *http.Request) {
	log := h.log.With("request_id", mwChi.GetReqID(r.Context()))
	taskID := chi.URLParam(r, "task_id")

	var dto api.CheckTaskRequestV1
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to decode request body: %w", err),
			http.StatusBadRequest,
			api.CheckTaskResponseV1{Error: "wrong body format"},
		)
		return
	}

	updatedTask, err := h.taskMutator.CheckTask(r.Context(), taskID, dto)
	if err != nil {
		sendResponse(
			log, w,
			fmt.Errorf("failed to update task from service layer: %w", err),
			http.StatusBadRequest,
			api.CheckTaskResponseV1{Error: "failed to update task"},
		)
		return
	}

	sendResponse(
		log, w, nil,
		http.StatusOK,
		api.CheckTaskResponseV1{Data: &updatedTask},
	)
}
