package restgin

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// @Summary		Включить\Выключить микрофон
// @Description	Включает или выключает микрофон участника
// @Tags			call
// @Router			/call/mic [patch]
// @Param			input	body	payloadCallMic	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	command.CallMic
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleCallMic(ctx *gin.Context) {
	var payload payloadCallMic
	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.CallMic(payload.Uuid)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadCallMic struct {
	Uuid string `json:"uuid" example:"1698993296.50511" binding:"required"`
}

// @Summary		Положить трубку
// @Description	Кладет трубку участника. Работает как в звонке 1 на 1 так и в конференции
// @Tags			call
// @Router			/call/hangup [patch]
// @Param			input	body	payloadCallHangup	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	command.Base
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleCallHangup(ctx *gin.Context) {
	var payload payloadCallHangup
	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.CallHangup(payload.Uuid)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadCallHangup struct {
	Uuid string `json:"uuid" example:"1698993296.50511" binding:"required"`
}

// @Summary		Перевод из в конференцию
// @Description	Переводит из звонка 1 на 1 в конференцию
// @Tags			call
// @Router			/call/morph-p2p-to-conference [put]
// @Param			input	body	payloadMorphP2PToConference	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	command.CallConference
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleCallMorphP2PToConference(ctx *gin.Context) {
	var payload payloadMorphP2PToConference
	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.CallMorphP2PToConference(payload.Uuid, payload.NewUsers)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadMorphP2PToConference struct {
	Uuid     string   `json:"uuid" example:"1698993296.50511" binding:"required"`
	NewUsers []string `json:"new_users" binding:"required"`
}
