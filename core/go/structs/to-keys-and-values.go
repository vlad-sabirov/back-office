package structs

import (
	"reflect"
	"slices"
)

func ToKeysAndValues(
	data any,
	ignoreEmpty bool,
	ignoreFields *[]string,
) (
	keys []string,
	values []any,
	err error,
) {
	v := reflect.ValueOf(data)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		err = ErrNotStruct
		return keys, values, err
	}

	t := v.Type()

	for i := 0; i < v.NumField(); i++ {
		field := t.Field(i)
		tag := field.Tag.Get("json")
		value := v.Field(i).Interface()

		if ignoreFields != nil && slices.Contains(*ignoreFields, tag) {
			continue
		}

		if ignoreEmpty && reflect.DeepEqual(
			value,
			reflect.Zero(v.Field(i).Type()).Interface(),
		) {
			continue
		}

		keys = append(keys, tag)
		values = append(values, value)
	}

	return keys, values, err
}
