#!/bin/sh
set -e

APP_ENV="${APP_ENV:-development}"
echo "=================================================="
echo " Starting LoftDesign App [Mode: ${APP_ENV}]"
echo "=================================================="

# Function to wait for database connection if DB_HOST is set
if [ -n "$DB_HOST" ]; then
    echo "Waiting for database connection at ${DB_HOST}:${DB_PORT:-5432}..."
    python - <<END
import os, sys, time, socket
host = os.environ.get("DB_HOST", "db")
port = int(os.environ.get("DB_PORT", "5432"))
timeout = 30
start = time.time()
while time.time() - start < timeout:
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"Database port {host}:{port} is open and ready!")
            sys.exit(0)
    except OSError:
        time.sleep(1)
print(f"Warning: Timed out waiting for {host}:{port}. Proceeding anyway...")
END
fi

if [ "$APP_ENV" = "development" ] || [ "$APP_ENV" = "dev" ]; then
    echo ">>> Running in DEVELOPMENT mode:"
    echo "1. Generating migrations..."
    python manage.py makemigrations user_auth dashboard

    echo "2. Applying database migrations..."
    python manage.py migrate --noinput

    echo "3. Initializing admin and catalog..."
    python manage.py init_admin 2>/dev/null || true
    python manage.py seed_catalog 2>/dev/null || true

    echo "4. Compiling translation messages..."
    python manage.py compilemessages --ignore=.venv 2>/dev/null || true
else
    echo ">>> Running in ${APP_ENV} mode:"
    echo "1. Generating migrations..."
    python manage.py makemigrations user_auth dashboard

    echo "2. Applying database migrations..."
    python manage.py migrate --noinput

    echo "3. Collecting static files..."
    python manage.py collectstatic --noinput

    echo "4. Compiling translation messages..."
    python manage.py compilemessages --ignore=.venv 2>/dev/null || true
fi

echo "=================================================="
echo " Executing application command: $@"
echo "=================================================="

exec "$@"
