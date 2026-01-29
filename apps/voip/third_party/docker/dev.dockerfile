FROM golang:1.24-alpine3.21

WORKDIR /app

COPY ./ ./
# RUN go get github.com/cosmtrek/air && go install github.com/cosmtrek/air
RUN go install github.com/air-verse/air@v1.61.0

CMD ["air", "--build.cmd", "go build -o /app/bin/voip /app/cmd/voip", "--build.bin", "/app/bin/voip"]
