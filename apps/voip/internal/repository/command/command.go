package command

import "time"

type Command interface {
	P2PCreate(caller string, receiver string) (CallP2P, Error)
	P2PRedirect(uuid string, receiver string) (CallRedirect, Error)
	ConferenceCreate(users []string) (CallConference, Error)
	ConferenceAdd(uuid string, users []string) (CallConference, Error)
	CallMic(uuid string) (CallMic, Error)
	CallHangup(uuid string) (Base, Error)
	CallMorphP2PToConference(uuid string, users []string) (CallConference, Error)
	Analytics(phones []string, input bool, output bool, dateStart, dateEnd time.Time) (Analytic, Error)
	MissedCalls(phones []string, skipChecked bool, dateStart, dateEnd time.Time) ([]AnalyticItem, Error)
	MissedCallsCheck(uuid string) (MissedCallCheck, Error)
	Recordings(phones []string, dateStart, dateEnd time.Time) ([]AnalyticItem, Error)
}

type Error struct {
	Code    int    `json:"code"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type Base struct {
	Code   int    `json:"code"`
	Status string `json:"status"`
}

type CallP2P struct {
	Base
	Timestamp time.Time `json:"timestamp"`
	UUID      string    `json:"uuid"`
	Users     [2]struct {
		Caller string `json:"caller"`
		Uuid   string `json:"uuid"`
		Role   string `json:"role"`
		Mute   bool   `json:"mute"`
	} `json:"users"`
}

type CallRedirect struct {
	Base
	CallerUUID   string `json:"caller_uuid"`
	ReceiverUUID string `json:"receiver_uuid"`
}

type CallMic struct {
	Base
	Mute bool `json:"mute"`
}

type CallConference struct {
	Base
	ConferenceUuid string `json:"conference_uuid"`
	Users          []struct {
		Caller string `json:"caller"`
		Uuid   string `json:"uuid"`
		Role   string `json:"role"`
	} `json:"users"`
}

type AnalyticItem struct {
	AnalyticStage
	Stages []AnalyticStage `json:"stages"`
}

type AnalyticStage struct {
	CallID     string    `json:"call_id"`
	UUID       string    `json:"uuid"`
	CallType   string    `json:"call_type"`
	Caller     string    `json:"caller"`
	Receiver   string    `json:"receiver"`
	Did        string    `json:"did"`
	Timestamp  time.Time `json:"timestamp"`
	Duration   float64   `json:"duration"`
	IsChecked  bool      `json:"is_checked"`
	IsAnswered bool      `json:"is_answered"`
	File       string    `json:"file"`
	Queue      string    `json:"queue"`
	CallMark   string    `json:"call_mark"`
}

type Analytic struct {
	CountAnswered int            `json:"count_answered"`
	CountMissed   int            `json:"count_missed"`
	Duration      float64        `json:"duration"`
	Answered      []AnalyticItem `json:"answered"`
	Missed        []AnalyticItem `json:"missed"`
}

type MissedCallCheck struct {
	Base
	UUID      string `json:"uuid"`
	IsChecked bool   `json:"is_checked"`
}
