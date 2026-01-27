package postgresql

import "errors"

var (
	ErrMaxConnsNotFilled     = errors.New("MaxConns must be filled")
	ErrMaxRetriesNotFilled   = errors.New("MaxRetries must be filled")
	ErrRetryTimeOutNotFilled = errors.New("RetryTimeOut must be filled")
)
