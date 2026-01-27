package restgin

import (
	_ "github.com/dsbasko/back-office.uz/tree/main/apps/voip/docs"
	"github.com/gin-gonic/gin"
	"net/http"
)

// @Summary		Создать звонок
// @Description	Создает звонок 1 на 1
// @Tags			p2p
// @Router			/p2p/create [post]
// @Param			input	body	payloadP2PCrate	true	" "
// @Accept			json
// @Produce		json
// @Success		201	{object}	command.CallP2P
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleP2PCreate(ctx *gin.Context) {
	var payload payloadP2PCrate
	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.P2PCreate(payload.Caller, payload.Receiver)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusCreated, res)
}

type payloadP2PCrate struct {
	Caller   string `json:"caller" example:"137" binding:"required"`
	Receiver string `json:"receiver" example:"138" binding:"required"`
}

// @Summary		Переадресация
// @Description	Переадресовывает звонок 1 на 1
// @Tags			p2p
// @Router			/p2p/redirect [patch]
// @Param			input	body	payloadP2PRedirect	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	command.CallRedirect
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleP2PRedirect(ctx *gin.Context) {
	var payload payloadP2PRedirect
	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.P2PRedirect(payload.Uuid, payload.Receiver)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadP2PRedirect struct {
	Uuid     string `json:"uuid" example:"1698993296.50511" binding:"required"`
	Receiver string `json:"receiver" example:"139" binding:"required"`
}
