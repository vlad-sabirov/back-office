package resthelper

import (
	"encoding/json"
	"fmt"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
	"strings"
	"time"
)

func (h *HelperREST) Analytics(
	phones []string, input bool, output bool, dateStart, dateEnd time.Time,
) (command.Analytic, command.Error) {
	var outputResponse command.Analytic
	var outputError command.Error

	params := strings.Builder{}
	params.WriteString(fmt.Sprintf("input=%t", input))
	params.WriteString(fmt.Sprintf("&output=%t", output))
	params.WriteString(fmt.Sprintf("&date_start=%v", dateStart.Format(time.RFC3339)))
	params.WriteString(fmt.Sprintf("&date_end=%v", dateEnd.Format(time.RFC3339)))

	fmt.Println(phones)
	for _, phone := range phones {
		params.WriteString(fmt.Sprintf("&phones=%v", phone))
	}

	res, err := h.client.R().
		SetQueryString(params.String()).
		SetResult(&outputResponse).
		Get("/call_analytics")
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = "Helper request error"
		h.log.Errorf("call analytics error: get recordings from helper: %v", err)
		return command.Analytic{}, outputError
	}

	err = json.Unmarshal(res.Body(), &outputResponse)
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = string(res.Body())
		h.log.Errorf("call analytics error: get recordings from helper: %v", err)
		return command.Analytic{}, outputError
	}

	return outputResponse, command.Error{}
}
