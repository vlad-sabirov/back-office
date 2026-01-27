package restgin

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// @Summary		Ping
// @Description	Функция для проверки связи с микросервисом
// @Tags			system
// @Router			/ping [get]
//
//	@Produce		plain
//
// @Success		200	{string}	string	"pong"
func (h HTTPServer) handlePing(ctx *gin.Context) {
	ctx.String(http.StatusOK, "pong")
}
