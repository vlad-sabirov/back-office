FROM nginx:1.23.1-alpine
# RUN apk update && apk add openssl

# RUN openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048 &&\
#     openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /etc/ssl/certs/self.key -out /etc/ssl/certs/self.crt \
#     -subj "/C=UZ/ST=Tashkent/L=Tashkent/O=ImexGroup/OU=Org/CN=back-office.local"
