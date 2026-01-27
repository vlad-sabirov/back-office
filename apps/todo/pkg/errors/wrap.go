package errors

import (
	"fmt"

	"github.com/dsbasko/back-office.uz/core/logger"
)

func ErrorPtrWithOP(err *error, op string) { //nolint:gocritic
	if *err != nil {
		*err = fmt.Errorf("%s -> %w", op, *err)
	}
}

func ErrorWithOP(err error, op string) error {
	if err != nil {
		return fmt.Errorf("%s: %v", op, err)
	}
	return nil
}

func LogWithOP(log logger.Logger, err error, op string) {
	if err != nil {
		log.Errorf("%s: %v", op, err)
	}
}
