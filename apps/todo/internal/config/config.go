package config

import (
	"fmt"
	"sync"
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type config struct {
	Env         string `env:"ENV"`
	ServiceName string `env:"SERVICE_NAME"`

	RestReadTimeout  int `env:"REST_READ_TIMEOUT"`
	RestWriteTimeout int `env:"REST_WRITE_TIMEOUT"`

	PsqlHost     string `env:"PSQL_HOST"`
	PsqlPort     string `env:"PSQL_PORT"`
	PsqlUser     string `env:"PSQL_USER"`
	PsqlPass     string `env:"PSQL_PASS"`
	PsqlDB       string `env:"PSQL_DB"`
	PsqlDSN      string `env:"TODO_PSQL_DSN"`
	PsqlMaxPools int    `env:"PSQL_MAX_POOLS"`
}

var (
	cfg  config
	once sync.Once
	err  error
)

func Init() error {
	once.Do(func() {
		err = cleanenv.ReadEnv(&cfg)
	})

	if err != nil {
		return fmt.Errorf("cleanenv.ReadEnv: %w", err)
	}

	return nil
}

func MustInit() {
	if err = Init(); err != nil {
		panic(err)
	}
}

func Env() string {
	return cfg.Env
}

func ServiceName() string {
	return cfg.ServiceName
}

func RestReadTimeout() time.Duration {
	return time.Duration(cfg.RestReadTimeout) * time.Millisecond
}

func RestWriteTimeout() time.Duration {
	return time.Duration(cfg.RestWriteTimeout) * time.Millisecond
}

func PsqlMaxPools() int {
	return cfg.PsqlMaxPools
}

func PsqlConnectingString() string {
	return cfg.PsqlDSN
}

func SetPsqlConnectingString(newVal string) {
	cfg.PsqlDSN = newVal
}
