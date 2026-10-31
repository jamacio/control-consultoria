# O container roda como o usuário node (uid 1000) e precisa gravar em public/; um git pull como root deixa os arquivos do root
up:
	@if [ "$$(id -u)" = 0 ]; then chown -R 1000:1000 public; fi
	docker compose -f docker-compose.yml up -d --build --remove-orphans

watch:
	docker compose -f docker-compose.yml up --build --remove-orphans

stop:
	docker compose -f docker-compose.yml stop

down:
	docker compose -f docker-compose.yml down -v
