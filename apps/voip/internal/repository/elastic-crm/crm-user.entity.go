package elasticcrm

type crmUserEntity struct {
	Hits struct {
		Hits []struct {
			Source crmUserContentEntity `json:"_source"`
		} `json:"hits"`

		Total struct {
			Value    int    `json:"value"`
			Relation string `json:"relation"`
		} `json:"total"`
	} `json:"hits"`
}

type crmUserContentEntity struct {
	PhoneMobile string `json:"phoneMobile"`
	PhoneVoip   string `json:"phoneVoip"`
	IsFired     int    `json:"isFired"`
}
