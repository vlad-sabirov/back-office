package resthelper

import (
	"encoding/json"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
)

func (h *HelperREST) CallMic(uuid string) (command.CallMic, command.Error) {
	var outputResponse command.CallMic
	var outputError command.Error

	res, err := h.client.R().
		SetBody(map[string]string{"uuid": uuid}).
		SetResult(&outputResponse).
		Put("/call/mic")
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
