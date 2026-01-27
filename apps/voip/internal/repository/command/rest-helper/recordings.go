package resthelper

import (
	"encoding/json"
	"fmt"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
	"strings"
	"time"
)

func (h *HelperREST) Recordings(phones []string, dateStart, dateEnd time.Time) ([]command.AnalyticItem, command.Error) {
	var outputResponse []command.AnalyticItem
	var outputError command.Error

	params := strings.Builder{}
	params.WriteString(fmt.Sprintf("&date_start=%v", dateStart.Format(time.RFC3339)))
	params.WriteString(fmt.Sprintf("&date_end=%v", dateEnd.Format(time.RFC3339)))
	for _, phone := range phones {
		params.WriteString(fmt.Sprintf("&phones=%v", phone))
	}

	res, err := h.client.R().
		SetQueryString(params.String()).
		SetResult(&outputResponse).
		Get("/call_recordings")
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = "Helper request error"
		return []command.AnalyticItem{}, outputError
	}

	err = json.Unmarshal(res.Body(), &outputResponse)
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = string(res.Body())
		return []command.AnalyticItem{}, outputError
	}

	return outputResponse, command.Error{}
}
