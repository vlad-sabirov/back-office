FROM golang:1.24-alpine3.21

WORKDIR /app

COPY ./ ./
RUN go build -o ./bin/voip ./cmd/voip

CMD ["/app/bin/voip"]
