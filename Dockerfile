FROM php:8.5-apache
RUN apt-get update && apt-get install -y libcurl4-openssl-dev && \
  docker-php-ext-install curl && \
  rm -rf /var/lib/apt/lists/*
RUN sed -i -e 's/Listen 80/Listen 4000/' -e 's/:80>/:4000>/' /etc/apache2/ports.conf /etc/apache2/sites-enabled/000-default.conf
