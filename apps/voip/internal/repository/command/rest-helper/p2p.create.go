package resthelper

import (
	"encoding/json"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
)

func (h *HelperREST) P2PCreate(caller string, receiver string) (command.CallP2P, command.Error) {
	var outputResponse command.CallP2P
	var outputError command.Error

	res, err := h.client.R().
		SetBody(map[string]string{
			"caller":   caller,
			"receiver": receiver,
		}).
		SetResult(&outputResponse).
		Post("/call/p2p")
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
