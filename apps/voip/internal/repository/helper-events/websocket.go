package helperevents

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	httpserver "github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/controller/rest-gin"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/config"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	elasticcrm "github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/elastic-crm"
	"github.com/gorilla/websocket"
	"net/http"
	"os"
	"os/signal"
	"time"
)

type HelperEvents struct {
	log     *logger.Logger
	command command.Command
	events  *httpserver.Events
	elastic *elasticcrm.ElasticCRM
}

func New(
	log *logger.Logger,
	command command.Command,
	events *httpserver.Events,
	elastic *elasticcrm.ElasticCRM,
) *HelperEvents {
	return &HelperEvents{
		log:     log,
		command: command,
		events:  events,
		elastic: elastic,
	}
}

func (h *HelperEvents) connectWebSocket() (*websocket.Conn, error) {
	headers := http.Header{
		"Authorization": {
			"Basic " + base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf(
				"%v:%v",
				config.GetHelperUsername(),
				config.GetHelperPassword(),
			))),
		},
	}

	connect, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf(
		"ws://%v:%v/call/events",
		config.GetHelperHost(),
		config.GetHelperPort(),
	), headers)
	if err != nil {
		return nil, err
	}

	return connect, nil
}

func (h *HelperEvents) Run() {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	var connect *websocket.Conn
	var err error
	var connected bool

	reconnectTicker := time.NewTicker(10 * time.Second)
	defer reconnectTicker.Stop()

	for !connected {
		connect, err = h.connectWebSocket()
		if err != nil {
			h.log.Error("Ошибка при подключении к серверу WebSocket: " + err.Error())
			select {
			case <-interrupt:
				h.log.Info("Завершение работы по сигналу прерывания.")
				return
			case <-reconnectTicker.C:
			}
		} else {
			connected = true
		}
	}
	defer func() {
		err = connect.Close()
		if err != nil {

		}
	}()

	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			_, message, err := connect.ReadMessage()
			if err != nil {
				if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
					os.Exit(1)
				} else if websocket.IsUnexpectedCloseError(
					err,
					websocket.CloseGoingAway,
					websocket.CloseAbnormalClosure,
				) {
					h.log.Error("Ошибка при чтении сообщения: " + err.Error())
				}
				break
			}

			h.events.SetLastMessage(message)
			h.events.SendMessage(message)
		}
	}()

	select {
	case <-done:
	case <-interrupt:
		h.log.Info("Завершение работы по сигналу прерывания.")
	}

	err = connect.WriteMessage(
		websocket.CloseMessage,
		websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""),
	)
	if err != nil {
		h.log.Error("Ошибка при закрытии соединения: " + err.Error())
		return
	}

	select {
	case <-done:
	case <-time.After(time.Second):
	}
}

func (h *HelperEvents) messageUnmarshal(message []byte) ([]EventsEntity, error) {
	var data []EventsEntity
	err := json.Unmarshal(message, &data)
	if err != nil {
		h.log.Debug(err.Error())
		return nil, err
	}
	return data, nil
}
