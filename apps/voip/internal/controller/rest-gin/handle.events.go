package restgin

import (
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

type Events struct {
	clients     map[*websocket.Conn]bool
	log         *logger.Logger
	lastMessage []byte
	mu          sync.RWMutex
}

func NewEvents(log *logger.Logger) *Events {
	return &Events{
		clients: make(map[*websocket.Conn]bool),
		log:     log,
	}
}

func (e *Events) handleEvents(ctx *gin.Context) {
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		e.log.Debug(err.Error())
		return
	}
	defer func() {
		err = conn.Close()
		if err != nil {
			e.log.Debug(err.Error())
		}
	}()

	e.mu.Lock()
	e.clients[conn] = true
	e.mu.Unlock()
	e.mu.RLock()
	err = conn.WriteMessage(websocket.TextMessage, e.lastMessage)
	e.mu.RUnlock()
	if err != nil {
		e.log.Debug(err.Error())
		err = conn.Close()
		if err != nil {
			e.log.Debug(err.Error())
		}
		e.mu.Lock()
		delete(e.clients, conn)
		e.mu.Unlock()
	}

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			e.log.Debug(err.Error())
			return
		}
	}
}

func (e *Events) SendMessage(message []byte) {
	for client := range e.clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			e.log.Debug(err.Error())
			err = client.Close()
			if err != nil {
				e.log.Debug(err.Error())
			}
			e.mu.Lock()
			delete(e.clients, client)
			e.mu.Unlock()
		}
	}
}

func (e *Events) SetLastMessage(message []byte) {
	e.mu.Lock()
	e.lastMessage = message
	e.mu.Unlock()
}
