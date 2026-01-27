FROM golang:1.22-alpine3.19
WORKDIR /app
CMD ["go", "run", "./cmd/todo/main.go"]
