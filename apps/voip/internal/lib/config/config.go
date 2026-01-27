package config

import (
	"fmt"
	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Env            string    `env:"NODE_ENV" env-default:"production"`
	Port           string    `yaml:"port"`
	HelperHost     string    `yaml:"helper-host" env:"VOIP_HELPER_HOST" env-required:"true"`
	HelperPort     string    `yaml:"helper-port" env:"VOIP_HELPER_PORT" env-required:"true"`
	HelperUsername string    `yaml:"helper-username" env:"VOIP_HELPER_USERNAME" env-required:"true"`
	HelperPassword string    `yaml:"helper-password" env:"VOIP_HELPER_PASSWORD" env-required:"true"`
	ElasticHost    string    `env:"ELASTIC_CONTAINER_NAME" env-required:"true"`
	ElasticPort    string    `env:"ELASTIC_DEFAULT_PORT" env-required:"true"`
	BasicAuth      BasicAuth `yaml:"basic-auth" env-required:"true"`
}

type BasicAuth struct {
	User string `yaml:"user"`
	Pass string `yaml:"pass"`
}

var cfg Config

func MustLoad() error {
	err := cleanenv.ReadConfig("./config/config.yaml", &cfg)
	if err != nil {
		return fmt.Errorf(err.Error())
	}
	return nil
}

func GetEnv() string {
	return cfg.Env
}

func GetPort() string {
	return cfg.Port
}

func GetHelperHost() string {
	return cfg.HelperHost
}

func GetHelperPort() string {
	return cfg.HelperPort
}

func GetHelperUsername() string {
	return cfg.HelperUsername
}

func GetHelperPassword() string {
	return cfg.HelperPassword
}

func GetElasticHost() string {
	return cfg.ElasticHost
}

func GetElasticPort() string {
	return cfg.ElasticPort
}

func GetBasicAuth() BasicAuth {
	return cfg.BasicAuth
}
