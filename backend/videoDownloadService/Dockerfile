FROM python:3-alpine

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY . .

RUN chmod a+rx youtube-dl
