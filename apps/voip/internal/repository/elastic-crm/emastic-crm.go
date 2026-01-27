package elasticcrm

import (
	"encoding/json"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/config"
	"github.com/dsbasko/back-office.uz/tree/main/apps/voip/internal/lib/logger"
	"github.com/elastic/go-elasticsearch/v7"
	"strconv"
	"strings"
)

type ElasticCRM struct {
	log    *logger.Logger
	client *elasticsearch.Client
}

func New(log *logger.Logger) (*ElasticCRM, error) {
	elasticClient, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{"http://" + config.GetElasticHost() + ":" + config.GetElasticPort()},
	})
	if err != nil {
		log.Debug(err.Error())
		return nil, err
	}

	return &ElasticCRM{
		log:    log,
		client: elasticClient,
	}, nil
}

func (e *ElasticCRM) SearchPhone(phone string) (string, bool, error) {
	orgPhone, orgOk, orgErr := e.searchOrganization(phone)
	if len(orgPhone) > 0 {
		return orgPhone, orgOk, orgErr
	}

	contPhone, contOk, contErr := e.searchContact(phone)
	if len(contPhone) > 0 {
		return contPhone, contOk, contErr
	}

	return "", false, nil
}

func (e *ElasticCRM) searchOrganization(phone string) (string, bool, error) {
	/* Запрос */
	res, err := e.client.Search(
		e.client.Search.WithIndex("crm_organization"),
		e.client.Search.WithBody(strings.NewReader(`
			{ "query": { "match": { "phones": "`+phone+`" } } }
		`)),
	)
	if err != nil {
		e.log.Warn(err.Error())
	}
	defer func() {
		err = res.Body.Close()
		if err != nil {

		}
	}()

	var dataJSON crmOrganizationEntity
	jsonDecoder := json.NewDecoder(res.Body)
	err = jsonDecoder.Decode(&dataJSON)
	if err != nil {
		return "", false, err
	}
	if dataJSON.Hits.Total.Value < 1 || dataJSON.Hits.Hits[0].Source.UserId == 0 {
		return "", false, nil
	}

	return e.searchUser(dataJSON.Hits.Hits[0].Source.UserId)
}

func (e *ElasticCRM) searchContact(phone string) (string, bool, error) {
	/* Запрос */
	res, err := e.client.Search(
		e.client.Search.WithIndex("crm_contact"),
		e.client.Search.WithBody(strings.NewReader(`
			{ "query": { "match": { "phones": "`+phone+`" } } }
		`)),
	)
	if err != nil {
		e.log.Warn(err.Error())
	}
	defer func() {
		err = res.Body.Close()
		if err != nil {
		}
	}()

	var dataJSON crmContactEntity
	jsonDecoder := json.NewDecoder(res.Body)
	err = jsonDecoder.Decode(&dataJSON)
	if err != nil {
		return "", false, err
	}
	if dataJSON.Hits.Total.Value < 1 || dataJSON.Hits.Hits[0].Source.UserId == 0 {
		return "", false, nil
	}

	return e.searchUser(dataJSON.Hits.Hits[0].Source.UserId)
}

func (e *ElasticCRM) searchUser(id int) (string, bool, error) {
	/* Запрос */
	res, err := e.client.Search(
		e.client.Search.WithIndex("user"),
		e.client.Search.WithBody(strings.NewReader(`
			{ "query": { "match": { "id": "`+strconv.Itoa(id)+`" } } }
		`)),
	)
	if err != nil {
		e.log.Warn(err.Error())
	}
	defer func() {
		err = res.Body.Close()
		if err != nil {

		}
	}()

	var dataJSON crmUserEntity
	jsonDecoder := json.NewDecoder(res.Body)
	err = jsonDecoder.Decode(&dataJSON)
	if err != nil {
		return "", false, err
	}
	if dataJSON.Hits.Total.Value < 1 {
		return "", false, nil
	}

	if dataJSON.Hits.Hits[0].Source.IsFired == 1 {
		return "", false, nil
	}

	if len(dataJSON.Hits.Hits[0].Source.PhoneVoip) > 1 {
		return dataJSON.Hits.Hits[0].Source.PhoneVoip, true, nil
	}

	if len(dataJSON.Hits.Hits[0].Source.PhoneMobile) > 1 {
		return dataJSON.Hits.Hits[0].Source.PhoneMobile, true, nil
	}

	return "", false, nil
}
