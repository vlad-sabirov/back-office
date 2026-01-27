package structs

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestToKeysAndValues(t *testing.T) {
	var emptyKeys []string
	var emptyValues []any

	type mockStruct struct {
		Allons     string `json:"allons"`
		MainAnswer string `json:"main_answer"`
	}

	type args struct {
		data         any
		ignoreEmpty  bool
		ignoreFields *[]string
	}

	tests := []struct {
		name       string
		args       args
		wantKeys   []string
		wantValues []any
		wantErr    error
	}{
		{
			name: "Not Struct and Not Pointer",
			args: args{
				data: map[string]string{
					"allons": "y!",
				},
				ignoreEmpty:  false,
				ignoreFields: nil,
			},
			wantKeys:   emptyKeys,
			wantValues: emptyValues,
			wantErr:    ErrNotStruct,
		},
		{
			name: "Not Struct and Pointer",
			args: args{
				data: map[string]string{
					"allons": "y!",
				},
				ignoreEmpty:  false,
				ignoreFields: nil,
			},
			wantKeys:   emptyKeys,
			wantValues: emptyValues,
			wantErr:    ErrNotStruct,
		},
		{
			name: "Struct and Not Pointer",
			args: args{
				data: mockStruct{
					Allons:     "y!",
					MainAnswer: "42",
				},
				ignoreEmpty:  false,
				ignoreFields: nil,
			},
			wantKeys:   []string{"allons", "main_answer"},
			wantValues: []any{"y!", "42"},
			wantErr:    nil,
		},
		{
			name: "Struct and Pointer",
			args: args{
				data: &mockStruct{
					Allons:     "y!",
					MainAnswer: "42",
				},
				ignoreEmpty:  false,
				ignoreFields: nil,
			},
			wantKeys:   []string{"allons", "main_answer"},
			wantValues: []any{"y!", "42"},
			wantErr:    nil,
		},
		{
			name: "Not Ignore Empty",
			args: args{
				data: &mockStruct{
					Allons: "y!",
				},
				ignoreEmpty:  false,
				ignoreFields: nil,
			},
			wantKeys:   []string{"allons", "main_answer"},
			wantValues: []any{"y!", ""},
			wantErr:    nil,
		},
		{
			name: "Ignore Empty",
			args: args{
				data: &mockStruct{
					Allons: "y!",
				},
				ignoreEmpty:  true,
				ignoreFields: nil,
			},
			wantKeys:   []string{"allons"},
			wantValues: []any{"y!"},
			wantErr:    nil,
		},
		{
			name: "Ignore MainAnswer",
			args: args{
				data: &mockStruct{
					Allons:     "y!",
					MainAnswer: "42",
				},
				ignoreEmpty:  false,
				ignoreFields: &[]string{"main_answer"},
			},
			wantKeys:   []string{"allons"},
			wantValues: []any{"y!"},
			wantErr:    nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			keys, values, err := ToKeysAndValues(tt.args.data, tt.args.ignoreEmpty, tt.args.ignoreFields)
			assert.Equal(t, tt.wantKeys, keys)
			assert.Equal(t, tt.wantValues, values)
			assert.Equal(t, tt.wantErr, err)
		})
	}
}
