package elasticcrm

type crmContactEntity struct {
	Hits struct {
		Hits []struct {
			Source crmContactContentEntity `json:"_source"`
		} `json:"hits"`

		Total struct {
			Value    int    `json:"value"`
			Relation string `json:"relation"`
		} `json:"total"`
	} `json:"hits"`
}

type crmContactContentEntity struct {
	UserId int `json:"userId"`
}
