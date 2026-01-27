package restgin

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// @Summary		Создать конференцию
// @Description	Создает конференцию
// @Tags			conference
// @Router			/conference/create [post]
// @Param			input	body	payloadConferenceCreate	true	" "
// @Accept			json
// @Produce		json
// @Success		201	{object}	command.CallConference
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleConferenceCreate(ctx *gin.Context) {
	var payload payloadConferenceCreate
	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.ConferenceCreate(payload.Users)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusCreated, res)
}

type payloadConferenceCreate struct {
	Users []string `json:"users" binding:"required"`
}

// @Summary		Добавить участника
// @Description	Добавляет участника в конференцию
// @Tags			conference
// @Router			/conference/add [patch]
// @Param			input	body	payloadConferenceAdd	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	command.CallConference
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleConferenceAdd(ctx *gin.Context) {
	var payload payloadConferenceAdd
	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.ConferenceAdd(payload.Uuid, payload.Users)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadConferenceAdd struct {
	Uuid  string   `json:"uuid" example:"1698993296.50511" binding:"required"`
	Users []string `json:"users" binding:"required"`
}
