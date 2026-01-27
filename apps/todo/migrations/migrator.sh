#!/bin/bash

export DSN="host=$PSQL_CONTAINER_NAME port=$PSQL_PORT dbname=$PSQL_DB user=$PSQL_USER password=$PSQL_PASS"
sleep 2 && goose -dir ./migrations postgres "${DSN}" up -v
