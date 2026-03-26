#!/bin/bash
# PETANA — Server Setup Script
# Run on fresh Ubuntu 22.04 VPS
# Usage: bash setup-server.sh

set -e
echo "🐾 Setting up PETANA server..."

# ── 1. Update system ──
apt-get update -y && apt-get upgrade -y

# ── 2. Install Node.js 20 ──
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "✅ Node.js $(node -v)"

# ── 3. Install PM2 ──
npm install -g pm2
pm2 startup
echo "✅ PM2 installed"

# ── 4. Install PostgreSQL ──
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create DB + user
sudo -u postgres psql <<EOF
CREATE USER petana WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE petana_db OWNER petana;
GRANT ALL PRIVILEGES ON DATABASE petana_db TO petana;
EOF
echo "✅ PostgreSQL ready — change the password!"

# ── 5. Install Redis ──
apt-get install -y redis-server
systemctl start redis-server
systemctl enable redis-server
echo "✅ Redis running"

# ── 6. Install Nginx ──
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
echo "✅ Nginx running"

# ── 7. Install Certbot (SSL) ──
apt-get install -y certbot python3-certbot-nginx
echo "✅ Certbot ready"
echo "   Run: certbot --nginx -d petana.xyz -d www.petana.xyz -d api.petana.xyz"

# ── 8. Clone repo ──
mkdir -p /var/www/petana
cd /var/www/petana
git clone https://github.com/petana-xyz/petana.git .
npm ci

# ── 9. Setup .env ──
cp packages/backend/.env.example packages/backend/.env
echo ""
echo "⚠️  Edit /var/www/petana/packages/backend/.env with your values!"
echo "   nano /var/www/petana/packages/backend/.env"

# ── 10. Run migrations ──
echo "After editing .env, run:"
echo "  cd /var/www/petana && npx prisma migrate deploy --prefix packages/backend"
echo "  npm run build -w packages/backend"
echo "  pm2 start ecosystem.config.js"

echo ""
echo "🐾 Server setup complete!"
