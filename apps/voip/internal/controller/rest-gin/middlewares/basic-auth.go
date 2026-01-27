package middlewares

import (
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/config"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

func BasicAuth(log *logger.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		user, pass, ok := ctx.Request.BasicAuth()

		if !ok {
			log.Debugf("basic authorization required")
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"code":    http.StatusUnauthorized,
				"status":  "error",
				"message": "basic authorization required",
			})
			ctx.Abort()
			return
		}

		if user != config.GetBasicAuth().User || pass != config.GetBasicAuth().Pass {
			log.Debugf("invalid username or password")
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"code":    http.StatusUnauthorized,
				"status":  "error",
				"message": "invalid username or password",
			})
			time.Sleep(5 * time.Second)
			ctx.Abort()
			return
		}
	}
}
