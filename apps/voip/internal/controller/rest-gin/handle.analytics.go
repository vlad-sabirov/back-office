package restgin

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

// @Summary		Аналитика звонков
// @Description	Выводит аналитику по звонкам
// @Tags			analytics
// @Router			/analytics [post]
// @Param			input	body	payloadAnalytics	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	command.Analytic
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleAnalytics(ctx *gin.Context) {
	var payload payloadAnalytics

	if err := ctx.BindJSON(&payload); err != nil {
		h.log.Error(err)
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.Analytics(payload.Phones, payload.Output, payload.Input, payload.DateStart, payload.DateEnd)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadAnalytics struct {
	Phones    []string  `json:"phones" binding:"required"`
	Output    bool      `json:"output" example:"true"`
	Input     bool      `json:"input" example:"true"`
	DateStart time.Time `json:"date_start" example:"2023-11-06T00:00:00Z" binding:"required"`
	DateEnd   time.Time `json:"date_end" example:"2023-11-07T00:00:00Z" binding:"required"`
}

// @Summary		Аналитика пропущенных
// @Description	Выводит аналитику по пропущенным звонкам
// @Tags			analytics
// @Router			/analytics/missing [post]
// @Param			input	body	payloadMissedCalls	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	[]command.AnalyticItem
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleMissedCalls(ctx *gin.Context) {
	var payload payloadMissedCalls

	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.MissedCalls(payload.Phones, payload.SkipChecked, payload.DateStart, payload.DateEnd)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadMissedCalls struct {
	Phones      []string  `json:"phones" binding:"required"`
	SkipChecked bool      `json:"skip_checked" example:"false"`
	DateStart   time.Time `json:"date_start" example:"2023-11-06T00:00:00Z" binding:"required"`
	DateEnd     time.Time `json:"date_end" example:"2023-11-07T00:00:00Z" binding:"required"`
}

// @Summary		Пометить пропущенный звонок
// @Description	Метит пропущенный звонок как просмотренный
// @Tags			analytics
// @Router			/analytics/missing/check [patch]
// @Param			input	body	payloadMissedCallsCheck	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	command.MissedCallCheck
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleMissedCallsCheck(ctx *gin.Context) {
	var payload payloadMissedCallsCheck

	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.MissedCallsCheck(payload.UUID)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadMissedCallsCheck struct {
	UUID string `json:"uuid" example:"1699245805.52199" binding:"required"`
}

// @Summary		Получить записи звонков
// @Description	Выводит список звонков за период с ссылкой на файлы записи
// @Tags			analytics
// @Router			/analytics/recording [POST]
// @Param			input	body	payloadRecordings	true	" "
// @Accept			json
// @Produce		json
// @Success		200	{object}	[]command.AnalyticItem
// @Failure		400	{object}	command.Error
func (h HTTPServer) handleRecordings(ctx *gin.Context) {
	var payload payloadRecordings

	if err := ctx.BindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	res, err := h.command.Recordings(payload.Phones, payload.DateStart, payload.DateEnd)
	if err.Code != 0 {
		ctx.JSON(http.StatusBadRequest, err)
		return
	}
	ctx.JSON(http.StatusOK, res)
}

type payloadRecordings struct {
	Phones    []string  `json:"phones" binding:"required"`
	DateStart time.Time `json:"date_start" example:"2023-11-06T00:00:00Z" binding:"required"`
	DateEnd   time.Time `json:"date_end" example:"2023-11-07T00:00:00Z" binding:"required"`
}
