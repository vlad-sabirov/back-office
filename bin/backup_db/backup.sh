#!/bin/sh

# Создание бекапа
docker exec -it db_api sh /app/backup/backup.sh
docker exec -it db_account_1c sh /app/backup/backup.sh
