package handlers

import (
	"context"
	"net/http"

	mwChi "github.com/go-chi/chi/v5/middleware"
)

type Pinger interface {
	Ping(ctx context.Context) error
}

// Ping godoc
// @Summary			Проверка доступности сервиса
// @Description	Простой пинг-понг для проверки доступности сервиса
// @Tags				ping
// @Router			/ping [get]
// @Accept			text/plain
// @Produce			text/plain
// @Success			200	{object}	string "pong"
// @Failure			500
func (h *Handlers) Ping(w http.ResponseWriter, r *http.Request) {
	log := h.log.With("request_id", mwChi.GetReqID(r.Context()))

	if err := h.pinger.Ping(r.Context()); err != nil {
		log.Errorf("failed to ping: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte("pong")); err != nil {
		log.Errorf("failed to write response: %v", err)
	}
}
