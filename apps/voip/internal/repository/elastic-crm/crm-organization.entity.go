package elasticcrm

type crmOrganizationEntity struct {
	Hits struct {
		Hits []struct {
			Source crmOrganizationContentEntity `json:"_source"`
		} `json:"hits"`

		Total struct {
			Value    int    `json:"value"`
			Relation string `json:"relation"`
		} `json:"total"`
	} `json:"hits"`
}

type crmOrganizationContentEntity struct {
	UserId int `json:"userId"`
}
