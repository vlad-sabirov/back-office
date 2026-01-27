#!/bin/sh

clear;
docker exec -it db_api sh /app/backup/restore.sh;
docker exec -it db_account_1c sh /app/backup/restore.sh;
