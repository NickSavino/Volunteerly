.PHONY: all help build rebuild clean dev db server web

# Default Target
all: help

help: 
	@echo "Available commands:"
	@echo "  make build       - Build the Docker images"
	@echo "  make rebuild     - Rebuild the Docker images without cache"
	@echo "  make clean       - Stop and remove all containers, networks, and volumes"
	@echo "  make stop        - Stop all running containers"
	@echo "  make dev         - Start the development environment (builds if necessary)"
	@echo "  make dev-d       - Start dev detached"
	@echo "  make db          - Start only the database container"
	@echo "  make server      - Start only the server container"
	@echo "  make client      - Start only the web client container"
	@echo "  make db-d        - Start the database container detached"
	@echo "  make server-d    - Start the server container detached"
	@echo "  make web-d       - Start the web client container detached"

build:
	docker compose build

rebuild:
	docker compose build --no-cache

clean:
	docker compose down -v

stop:
	docker compose down

dev:
	docker compose up --build

dev-d:
	docker compose up --build -d

db:
	docker compose up db --build

db-d:
	docker compose up db --build -d

server:
	docker compose up server --build

server-d:
	docker compose up server --build -d

web:
	docker compose up client --build

web-d:
	docker compose up client --build -d