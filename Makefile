.PHONY: start-prod start-dev start-mac-dev start-prod-mac build build-mac stop backup restore-db restore-files
.SILENT:

start-prod: stop
	 docker compose \
		  -f docker-compose.yml \
		  -f docker-compose.prod.yml \
		  --env-file env/.env.local \
		  up -d

start-dev: stop
	docker compose \
		  -f docker-compose.yml \
		  -f docker-compose.dev.yml \
		  --env-file env/.env.local \
		  up --build -d

start-prod-mac: stop
	 docker compose \
		  -f docker-compose.yml \
		  -f docker-compose.mac.yml \
		  -f docker-compose.prod.yml \
		  --env-file env/.env.local \
		  up -d

start-dev-mac: stop
	docker compose \
		  -f docker-compose.yml \
		  -f docker-compose.mac.yml \
		  -f docker-compose.dev.yml \
		  --env-file env/.env.local \
		  up --build -d

build:
	 docker compose \
		  -f docker-compose.yml \
		  -f docker-compose.prod.yml \
		  --env-file env/.env.local \
		  build;

build-mac:
	 docker compose \
		  -f docker-compose.yml \
		  -f docker-compose.mac.yml \
		  -f docker-compose.prod.yml \
		  --env-file env/.env.local \
		  build;

stop: backup
	@if [ "$(RUNNING_CONTAINERS)" != "" ]; then \
		docker compose \
			-f docker-compose.yml \
        	-f docker-compose.prod.yml \
        	--env-file env/.env.local \
        	down; \
	 fi





backup:
	@if [ "$(RUNNING_CONTAINERS)" != "" ]; then \
		 sh bin/backup_db/backup.sh; \
	else \
		echo "No running containers detected."; \
	fi

restore-db:
	@if [ "$(RUNNING_CONTAINERS)" != "" ]; then \
		 ssh -t 192.168.25.235 'sh /app/bin/backup_db/backup.sh' && \
		 scp -r 192.168.25.235:/app/apps/api/third_party/db/backup/last.sql apps/api/third_party/db/backup && \
		 scp -r 192.168.25.235:/app/apps/account_1c/third_party/db/backup/test apps/account_1c/third_party/db/backup && \
		 sh bin/backup_db/restore.sh; \
	else \
		echo "No running containers detected."; \
	fi

restore-files:
	@if [ "$(RUNNING_CONTAINERS)" != "" ]; then \
		 scp -r 192.168.25.235:/app/apps/api/uploads apps/api/; \
	else \
		echo "No running containers detected."; \
	fi



# -------
# Helper
# -------

RUNNING_CONTAINERS := $(shell docker compose \
	-f docker-compose.yml \
	-f docker-compose.dev.yml \
	--env-file env/.env.local \
	ps --status running -q \
)
