FROM golang:1.21-alpine

# Instalando dependências necessárias para o CGO e SQLite
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

# Copiando apenas os arquivos do backend
COPY . .

# Habilitando CGO e compilando o projeto
ENV CGO_ENABLED=1
RUN go mod download
RUN go build -o main .

# Configurando a porta
ENV PORT=8080

# Rodando a aplicação
CMD ["./main"]