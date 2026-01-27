package helperevents

import "time"

type EventsEntity struct {
	CallId    string             `json:"call_id"`
	UUID      string             `json:"uuid"`
	Type      string             `json:"type"`
	Users     []EventsUserEntity `json:"users"`
	Did       string             `json:"did"` // На какой номер звонят
	Queue     string             `json:"queue"`
	Timestamp time.Time          `json:"timestamp"`
}

type EventsUserEntity struct {
	Caller string `json:"caller"`
	UUID   string `json:"uuid"`
	Role   string `json:"role"`
	Mute   bool   `json:"mute"`
}
