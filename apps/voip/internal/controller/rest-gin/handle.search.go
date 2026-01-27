package restgin

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// @Summary		Положить трубку
// @Description	Кладет трубку участника. Работает как в звонке 1 на 1 так и в конференции
// @Tags			search
// @ID				searchPhone
// @Param			phone	path	string	true	"Номер телефона для поиска"
// @Router			/search/{phone} [get]
// @Produce		plain
// @Success		200	{string}	string	"137"
// @Security		BasicAuth
func (h HTTPServer) handleSearch(ctx *gin.Context) {
	queryPhone := ctx.Param("phone")

	phone, _, err := h.elastic.SearchPhone(queryPhone)
	if err != nil {
		err = ctx.AbortWithError(http.StatusBadRequest, err)
		if err != nil {
			h.log.Errorf("ctx.AbortWithError -> %v", err.Error())
		}
		return
	}

	if len(phone) == 0 {
		ctx.JSON(http.StatusOK, gin.H{
			"code":   http.StatusOK,
			"status": "not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code":        http.StatusOK,
		"status":      "found",
		"redirect-to": phone,
	})
}
