.PHONY: build up down logs clean

build:
	docker-compose build --no-cache

up:
	docker-compose up -d

down:
	docker-compose down

clean:
	docker-compose down -v

logs:
	docker-compose logs -f
