.PHONY: install-deps lint
.SILENT:

install-deps:
	@GOBIN=$(LOCAL_BIN_PATH) go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.55.2
	@go mod tidy

lint:
	clear; $(LOCAL_BIN_PATH)/golangci-lint run -c $(CONFIG) --path-prefix $(CURDIR)

LOCAL_BIN_PATH := $(CURDIR)/bin
ROOT_PATH := $(realpath .)
CONFIG := $(ROOT_PATH)/.golangci.yaml
