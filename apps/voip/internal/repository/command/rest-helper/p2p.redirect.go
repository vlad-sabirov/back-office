package resthelper

import (
	"encoding/json"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
)

func (h *HelperREST) P2PRedirect(uuid string, receiver string) (command.CallRedirect, command.Error) {
	var outputResponse command.CallRedirect
	var outputError command.Error

	res, err := h.client.R().
		SetBody(map[string]string{
			"uuid":       uuid,
			"redirectTo": receiver,
		}).
		SetResult(&outputResponse).
		Put("/call/redirect")
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = "Helper request error"
		return outputResponse, outputError
	}

	err = json.Unmarshal(res.Body(), &outputResponse)
	if err != nil {
		outputError.Code = http.StatusBadRequest
		outputError.Status = "error"
		outputError.Message = string(res.Body())
		return outputResponse, outputError
	}
	return outputResponse, outputError
}
