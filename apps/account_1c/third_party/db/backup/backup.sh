#!/bin/env sh
PATH=/etc:/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

/usr/bin/mongodump --username "$ACCOUNT_1C_MONGO_AUTH_LOGIN" --password "$ACCOUNT_1C_MONGO_AUTH_PASSWORD" --authenticationDatabase admin --db test --out /app/backup
