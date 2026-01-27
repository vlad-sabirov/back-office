package middlewares

import (
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/gin-gonic/gin"
	"time"
)

func Logs(log *logger.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		args := []any{
			"request_method", ctx.Request.Method,
			"request_path", ctx.Request.URL.Path,
			"request_user_agent", ctx.Request.UserAgent(),
			"request_ip", ctx.ClientIP(),
		}
		timeStart := time.Now()

		ctx.Next()
		args = append(args, []any{
			"response_status", ctx.Writer.Status(),
			"response_bytes", ctx.Writer.Size(),
			"response_duration", time.Since(timeStart).String(),
		}...)

		ctx.Next()
		log.Debugw("http request completed", args...)
	}
}
