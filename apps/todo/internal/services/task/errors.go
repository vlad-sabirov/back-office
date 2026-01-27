package task

import (
	"errors"
	"fmt"
)

var (
	ErrMissingArguments       = errors.New("not all arguments are filled")
	ErrEmptyUserID            = errors.New("user_id must be greater than 0")
	ErrMinLengthName          = fmt.Errorf("name must be at least %d characters long", MinLengthName)
	ErrMaxLengthName          = fmt.Errorf("name must be no more than %d characters long", MaxLengthName)
	ErrMinLengthDesc          = fmt.Errorf("description must be at least %d characters long", MinLengthDescription)
	ErrOrganizationAndContact = errors.New("organization_id and contact_id cannot be filled at the same time")
)
