package handlers

import (
	"errors"
	"net/http"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"

	"github.com/dsbasko/back-office.uz/core/test"
)

func (hs *HandlerSuite) Test_Ping() {
	t := hs.T()

	tests := []struct {
		name           string
		storageCfg     func()
		wantStatusCode int
		wantBody       func() string
	}{
		{
			name: "Error",
			storageCfg: func() {
				hs.parts.pinger.EXPECT().
					Ping(gomock.Any()).
					Return(errors.New(""))
			},
			wantStatusCode: http.StatusInternalServerError,
			wantBody:       func() string { return "" },
		},
		{
			name: "Success",
			storageCfg: func() {
				hs.parts.pinger.EXPECT().
					Ping(gomock.Any()).
					Return(nil)
			},
			wantStatusCode: http.StatusOK,
			wantBody:       func() string { return "pong" },
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.storageCfg()

			resp, body := test.Request(t, hs.parts.ts, &test.RequestArgs{
				Method: "GET",
				Path:   "/ping",
			})
			err := resp.Body.Close()
			assert.NoError(t, err)

			assert.Equal(t, tt.wantStatusCode, resp.StatusCode)
			assert.Equal(t, tt.wantBody(), body)
		})
	}
}
