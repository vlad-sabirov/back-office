#!/bin/env bin
PATH=/etc:/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

COLLECTIONS="realization-month working-base"

for COLLECTION in $COLLECTIONS; do
  /usr/bin/mongosh --username "$ACCOUNT_1C_MONGO_AUTH_LOGIN" --password "$ACCOUNT_1C_MONGO_AUTH_PASSWORD" --authenticationDatabase admin --eval "db.getSiblingDB('test').getCollection('$COLLECTION').drop()";
done

/usr/bin/mongorestore --username "$ACCOUNT_1C_MONGO_AUTH_LOGIN" --password "$ACCOUNT_1C_MONGO_AUTH_PASSWORD" --authenticationDatabase admin /app/backup/;

#/usr/bin/mongosh --username "$ACCOUNT_1C_MONGO_AUTH_LOGIN" --password "$ACCOUNT_1C_MONGO_AUTH_PASSWORD" --authenticationDatabase admin --eval "db.getSiblingDB('test').getCollection('realization-month').drop()";
#/usr/bin/mongosh --username "$ACCOUNT_1C_MONGO_AUTH_LOGIN" --password "$ACCOUNT_1C_MONGO_AUTH_PASSWORD" --authenticationDatabase admin --eval "db.getSiblingDB('test').getCollection('working-base').drop()";
#/usr/bin/mongosh --eval "db.working-base.drop()";
