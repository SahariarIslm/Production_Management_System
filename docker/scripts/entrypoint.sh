#!/bin/sh
set -e

cd /var/www/html
echo "Backend entrypoint: preparing Laravel app..."

if [ ! -f ".env" ]; then
  echo "Backend entrypoint: creating .env from example..."
  cp .env.example .env
fi

if [ ! -d "vendor" ]; then
  echo "Backend entrypoint: installing Composer dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

echo "Backend entrypoint: preparing writable directories..."
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
rm -f bootstrap/cache/*.php

echo "Backend entrypoint: waiting for MySQL..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT:-3306};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  echo "Waiting for MySQL..."
  sleep 2
done

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  echo "Backend entrypoint: generating APP_KEY..."
  php artisan key:generate --force
fi

echo "Backend entrypoint: running migrations..."
php artisan migrate --force
echo "Backend entrypoint: running seeders..."
php artisan db:seed --force || true

echo "Backend entrypoint: starting PHP-FPM..."
exec php-fpm
