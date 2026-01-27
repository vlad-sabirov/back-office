include ../../env/.env.local

.PHONY: install-deps lint test test-cover test-cover-html test-cover-svg create-migration docs
.SILENT:

install-deps:
	@GOBIN=$(LOCAL_BIN_PATH) go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.55.2
	@GOBIN=$(LOCAL_BIN_PATH) go install github.com/golang/mock/mockgen@v1.6.0
	@GOBIN=$(LOCAL_BIN_PATH) go install github.com/swaggo/swag/cmd/swag@latest
	@GOBIN=$(LOCAL_BIN_PATH) go install github.com/pressly/goose/v3/cmd/goose@latest
	@GOBIN=$(LOCAL_BIN_PATH) go install github.com/nikolaydubina/go-cover-treemap@latest

lint:
	@clear;
	@$(LOCAL_BIN_PATH)/golangci-lint run -c $(CONFIG) --path-prefix $(CURDIR)

test:
	@clear;
	@go test ./... --cover --coverprofile=coverage.out --race

test-cover:
	@clear;
	@go test --coverprofile=coverage.out ./... > /dev/null;
	@go tool cover -func=coverage.out | grep total | grep -oE '[0-9]+(\.[0-9]+)?%'

test-cover-html:
	@clear;
	@go test --coverprofile=coverage.out ./... > /dev/null;
	@go tool cover -html coverage.out

test-cover-svg:
	@clear;
	@go test --coverprofile=coverage.out ./... > /dev/null;
	@$(LOCAL_BIN_PATH)/go-cover-treemap -coverprofile coverage.out > coverage.svg
	@xdg-open ./coverage.svg

create-migration:
	@clear
	@if [ -z "$(name)" ]; then \
		echo "Usage: make create-migration name=migration_name"; \
	else \
		$(LOCAL_BIN_PATH)/goose -dir ./migrations create $(name) sql; \
	fi

docs:
	@clear
	@$(LOCAL_BIN_PATH)/swag init -g ./cmd/todo/main.go
	@docker container restart $(TODO_CONTAINER_NAME)

LOCAL_BIN_PATH := $(CURDIR)/bin
ROOT_PATH := $(realpath .)
CONFIG := $(ROOT_PATH)/.golangci.yaml
