#!/bin/sh

SCRIPT=$(readlink -f "$0")
ROOT_PATH=$(realpath "${SCRIPT%/*/*/*}")
DATE_PATH=$(date +"%Y")/$(date +"%m")/$(date +"%d")
SLEEP_TIMER=5
CLOUD_PATH=/mnt/yadisk

# API
name='db_api'
path_container="$ROOT_PATH"/apps/api/third_party/db/backup/last.sql
path="$CLOUD_PATH"/"$name"
mkdir -p -m777 "$path"/"$DATE_PATH";
mkdir -p -m777 "$path"/last;
docker exec -it "$name" sh /app/backup/backup.sh;
sleep "$SLEEP_TIMER";
cp "$path_container" "$path"/"$DATE_PATH"/last.sql;
cp "$path_container" "$path"/last/last.sql;
sleep "$SLEEP_TIMER";

# Notification
name='db_notification'
path_container="$ROOT_PATH"/apps/notification/third_party/db/backup/last.sql
path="$CLOUD_PATH"/"$name"
mkdir -p -m777 "$path"/"$DATE_PATH";
mkdir -p -m777 "$path"/last;
docker exec -it "$name" sh /app/backup/backup.sh;
sleep "$SLEEP_TIMER";
cp "$path_container" "$path"/"$DATE_PATH"/last.sql;
cp "$path_container" "$path"/last/last.sql;
sleep "$SLEEP_TIMER";

# 1C
name='db_account_1c'
path_container="$ROOT_PATH"/apps/account_1c/third_party/db/backup/test
path="$CLOUD_PATH"/"$name"
mkdir -p -m777 "$path"/"$DATE_PATH";
mkdir -p -m777 "$path"/last;
docker exec -it "$name" sh /app/backup/backup.sh;
sleep "$SLEEP_TIMER";
cp "$path_container" "$path"/"$DATE_PATH"/test -R;
cp "$path_container" "$path"/last/test -R;
sleep "$SLEEP_TIMER";

# Раздача прав
chmod -R 777 $CLOUD_PATH/;
