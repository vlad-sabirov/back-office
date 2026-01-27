#!/bin/env bin
PATH=/etc:/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

PGPASSWORD=$API_DB_PASSWORD
export PGPASSWORD
psql -U $API_DB_USER $API_DB_DATABASE  -t -c "select 'drop table \"' || tablename || '\" cascade;' from pg_tables where schemaname = 'public'"  | psql -U $API_DB_USER $API_DB_DATABASE
psql -U $API_DB_USER $API_DB_DATABASE -f /app/backup/last.sql
unset PGPASSWORD
