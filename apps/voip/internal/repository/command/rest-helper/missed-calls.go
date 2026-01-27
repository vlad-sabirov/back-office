package resthelper

import (
	"encoding/json"
	"fmt"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
	"slices"
	"strings"
	"time"
)

func (h *HelperREST) MissedCalls(phones []string, skipChecked bool, dateStart, dateEnd time.Time) ([]command.AnalyticItem, command.Error) {
	var outputResponse []command.AnalyticItem
	var outputError command.Error

	params := strings.Builder{}
	params.WriteString(fmt.Sprintf("skip_checked=%t", skipChecked))
	params.WriteString(fmt.Sprintf("&date_start=%v", dateStart.Format(time.RFC3339)))
	params.WriteString(fmt.Sprintf("&date_end=%v", dateEnd.Format(time.RFC3339)))
	for _, phone := range phones {
		params.WriteString(fmt.Sprintf("&phones=%v", phone))
	}

	res, err := h.client.R().
		SetQueryString(params.String()).
		SetResult(&outputResponse).
		Get("/missing_call")
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = "Helper request error"
		return []command.AnalyticItem{}, outputError
	}

	var response []command.AnalyticItem
	err = json.Unmarshal(res.Body(), &response)
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = string(res.Body())
		return []command.AnalyticItem{}, outputError
	}

	for _, responseItem := range response {
		if slices.Contains(phones, responseItem.Caller) {
			continue
		}
		outputResponse = append(outputResponse, responseItem)
	}

	return outputResponse, command.Error{}
}
