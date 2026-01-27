#!/bin/env bin
PATH=/etc:/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

PGPASSWORD=$API_DB_PASSWORD
export PGPASSWORD
pg_dump -U $API_DB_USER $API_DB_DATABASE > /app/backup/last.sql
unset PGPASSWORD
