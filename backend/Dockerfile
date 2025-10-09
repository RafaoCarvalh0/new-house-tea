FROM golang:1.21-alpine

# Instalando dependências necessárias para o CGO e SQLite
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY backend/ ./

# Habilitando CGO e compilando o projeto
ENV CGO_ENABLED=1
RUN go mod tidy
RUN go build -o main .

# Configurando a porta
ENV PORT=8080

# Rodando a aplicação
CMD ["./main"]