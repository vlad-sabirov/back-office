package resthelper

import (
	"encoding/json"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/repository/command"
	"net/http"
)

func (h *HelperREST) ConferenceAdd(uuid string, users []string) (command.CallConference, command.Error) {
	var outputResponse command.CallConference
	var outputError command.Error
	var usersMap []map[string]string
	for _, val := range users {
		usersMap = append(usersMap, map[string]string{"caller": val})
	}

	res, err := h.client.R().
		SetBody(map[string]any{
			"uuid":  uuid,
			"users": usersMap,
		}).
		SetResult(&outputResponse).
		Put("/call/conference/push")
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
