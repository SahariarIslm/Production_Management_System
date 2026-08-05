#!/bin/sh
set -e

cd /var/www/html
echo "Worker entrypoint: preparing Laravel app..."

if [ ! -f ".env" ]; then
  echo "Worker entrypoint: creating .env from example..."
  cp .env.example .env
fi

if [ ! -d "vendor" ]; then
  echo "Worker entrypoint: installing Composer dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

echo "Worker entrypoint: preparing writable directories..."
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
rm -f bootstrap/cache/*.php

echo "Worker entrypoint: starting Supervisor..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
