package resthelper

import (
	"encoding/json"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
)

func (h *HelperREST) MissedCallsCheck(uuid string) (command.MissedCallCheck, command.Error) {
	var outputResponse command.MissedCallCheck
	var outputError command.Error

	res, err := h.client.R().
		SetBody(map[string]string{"uuid": uuid}).
		SetResult(&outputResponse).
		Put("/missing_call/check")
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = "Helper request error"
		return command.MissedCallCheck{}, outputError
	}

	err = json.Unmarshal(res.Body(), &outputResponse)
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = string(res.Body())
		return command.MissedCallCheck{}, outputError
	}

	return outputResponse, command.Error{}
}
