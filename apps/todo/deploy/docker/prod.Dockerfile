FROM golang:1.22-alpine3.19 as builder
WORKDIR /app

COPY ./apps/todo ./
COPY ./core/go /core/go

RUN go mod download
RUN go build -o ./bin/todo-service ./cmd/todo/main.go

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/bin .
CMD ["./todo-service"]
