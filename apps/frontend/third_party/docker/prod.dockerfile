FROM node:20.9.0

WORKDIR /app

ADD ./package*.json ./
ADD ./.npmrc ./.npmrc
RUN npm install
COPY ./ ./
RUN npm run build
