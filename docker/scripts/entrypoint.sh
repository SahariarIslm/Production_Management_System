#!/bin/sh
set -e

cd /var/www/html

# Wait for MySQL to be reachable
until php -r "new PDO('mysql:host=${DB_HOST};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  echo "Waiting for MySQL..."
  sleep 2
done

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force || true
php artisan config:cache
php artisan route:cache

exec php-fpm