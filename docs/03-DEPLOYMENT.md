\# Deployment Guide — Cimory Sales Academy



\---



\## 1. Prasyarat Server



\- \*\*OS:\*\* Ubuntu 22.04 LTS

\- \*\*Node.js:\*\* 20.x

\- \*\*PostgreSQL:\*\* 15+

\- \*\*Nginx:\*\* reverse proxy

\- \*\*PM2:\*\* process manager

\- \*\*Git:\*\* terinstall



\---



\## 2. Setup Server Pertama Kali



\### 2.1 Update System



```bash

sudo apt update \&\& sudo apt upgrade -y

```



\### 2.2 Install Node.js 20



```bash

curl -fsSL https://deb.nodesource.com/setup\_20.x | sudo -E bash -

sudo apt install -y nodejs

node -v  # harus v20.x

```



\### 2.3 Install PM2



```bash

sudo npm install -g pm2

```



\### 2.4 Install Nginx



```bash

sudo apt install -y nginx

sudo systemctl enable nginx

```



\### 2.5 Install PostgreSQL Client (jika DB external)



```bash

sudo apt install -y postgresql-client

```



\---



\## 3. Deploy Aplikasi



\### 3.1 Clone Repository



```bash

cd /var/www

sudo git clone https://gitlab.com/username/sales-academy.git

sudo chown -R $USER:$USER sales-academy

cd sales-academy

```



\### 3.2 Setup Backend (NestJS)



```bash

cd backend/nestjs

npm install --production

cp .env.example .env

nano .env  # isi config

npx prisma generate

npx prisma migrate deploy  # kalau pakai migration

```



\### 3.3 Setup Backend (Express Legacy)



```bash

cd ../  # balik ke backend/

npm install --production

cp .env.example .env

nano .env  # isi config

```



\### 3.4 Build Frontend (kalau pakai bundler)



```bash

cd ../../frontend

\# kalau pakai Vite:

npm install

npm run build

```



\---



\## 4. Setup PM2



\### 4.1 Start Aplikasi



```bash

cd /var/www/sales-academy/backend/nestjs

pm2 start npm --name "cimory-academy" -- run start:prod

```



\### 4.2 Save PM2 Config



```bash

pm2 save

pm2 startup  # ikutin instruksi yang muncul

```



\### 4.3 Cek Status



```bash

pm2 status

pm2 logs cimory-academy

```



\---



\## 5. Setup Nginx Reverse Proxy



\### 5.1 Bikin Config



```bash

sudo nano /etc/nginx/sites-available/cimory-academy

```



\*\*Isi:\*\*



```nginx

server {

&#x20;   listen 80;

&#x20;   server\_name academy.cimory.com;



&#x20;   # Redirect ke HTTPS

&#x20;   return 301 https://$host$request\_uri;

}



server {

&#x20;   listen 443 ssl http2;

&#x20;   server\_name academy.cimory.com;



&#x20;   # SSL (dari Certbot / Cloudflare)

&#x20;   ssl\_certificate /etc/letsencrypt/live/academy.cimory.com/fullchain.pem;

&#x20;   ssl\_certificate\_key /etc/letsencrypt/live/academy.cimory.com/privkey.pem;



&#x20;   # Security headers

&#x20;   add\_header X-Frame-Options "SAMEORIGIN" always;

&#x20;   add\_header X-Content-Type-Options "nosniff" always;

&#x20;   add\_header X-XSS-Protection "1; mode=block" always;



&#x20;   # Max upload size

&#x20;   client\_max\_body\_size 500M;



&#x20;   # Proxy ke Node.js

&#x20;   location / {

&#x20;       proxy\_pass http://localhost:4000;

&#x20;       proxy\_http\_version 1.1;

&#x20;       proxy\_set\_header Upgrade $http\_upgrade;

&#x20;       proxy\_set\_header Connection 'upgrade';

&#x20;       proxy\_set\_header Host $host;

&#x20;       proxy\_set\_header X-Real-IP $remote\_addr;

&#x20;       proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;

&#x20;       proxy\_set\_header X-Forwarded-Proto $scheme;

&#x20;       proxy\_cache\_bypass $http\_upgrade;

&#x20;       proxy\_read\_timeout 300s;

&#x20;   }

}

```



\### 5.2 Enable Site



```bash

sudo ln -s /etc/nginx/sites-available/cimory-academy /etc/nginx/sites-enabled/

sudo nginx -t

sudo systemctl reload nginx

```



\### 5.3 SSL dengan Certbot



```bash

sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d academy.cimory.com

```



\---



\## 6. Setup CI/CD (GitLab CI)



\### 6.1 Bikin `.gitlab-ci.yml` di Root Repo



```yaml

stages:

&#x20; - test

&#x20; - deploy



test:

&#x20; stage: test

&#x20; image: node:20

&#x20; script:

&#x20;   - cd backend/nestjs

&#x20;   - npm install

&#x20;   - npm run build

&#x20; only:

&#x20;   - main



deploy:

&#x20; stage: deploy

&#x20; image: alpine:latest

&#x20; before\_script:

&#x20;   - apk add --no-cache openssh-client rsync

&#x20;   - eval $(ssh-agent -s)

&#x20;   - echo "$SSH\_PRIVATE\_KEY" | tr -d '\\r' | ssh-add -

&#x20;   - mkdir -p \~/.ssh

&#x20;   - chmod 700 \~/.ssh

&#x20;   - ssh-keyscan $SERVER\_HOST >> \~/.ssh/known\_hosts

&#x20; script:

&#x20;   - rsync -avz --delete backend/ $SERVER\_USER@$SERVER\_HOST:/var/www/sales-academy/backend/

&#x20;   - ssh $SERVER\_USER@$SERVER\_HOST "cd /var/www/sales-academy/backend/nestjs \&\& npm install --production \&\& npx prisma generate \&\& pm2 restart cimory-academy"

&#x20; only:

&#x20;   - main

```



\### 6.2 Setup Variables di GitLab



GitLab → \*\*Settings\*\* → \*\*CI/CD\*\* → \*\*Variables\*\*:



\- `SSH\_PRIVATE\_KEY` — private key SSH server

\- `SERVER\_HOST` — IP/hostname server

\- `SERVER\_USER` — username SSH



\---



\## 7. Monitoring \& Logging



\### 7.1 PM2 Monitoring



```bash

pm2 monit

pm2 logs cimory-academy --lines 100

```



\### 7.2 Log Rotate



```bash

pm2 install pm2-logrotate

pm2 set pm2-logrotate:max\_size 10M

pm2 set pm2-logrotate:retain 7

```



\### 7.3 UptimeRobot



1\. Daftar di \[uptimerobot.com](https://uptimerobot.com)

2\. Add Monitor → HTTP(s)

3\. URL: `https://academy.cimory.com/api/v2/health`

4\. Interval: 5 menit

5\. Alert: email + Slack



\### 7.4 Sentry



1\. Daftar di \[sentry.io](https://sentry.io)

2\. Install SDK: `npm install @sentry/node`

3\. Setup di `main.ts` NestJS



\---



\## 8. Backup



\### 8.1 Database Backup (Daily)



```bash

sudo nano /usr/local/bin/backup-db.sh

```



\*\*Isi:\*\*



```bash

\#!/bin/bash

DATE=$(date +%Y%m%d\_%H%M%S)

BACKUP\_DIR="/var/backups/cimory"

mkdir -p $BACKUP\_DIR

pg\_dump $DATABASE\_URL | gzip > $BACKUP\_DIR/db\_$DATE.sql.gz

find $BACKUP\_DIR -name "db\_\*.sql.gz" -mtime +30 -delete

```



\*\*Setup cron:\*\*



```bash

chmod +x /usr/local/bin/backup-db.sh

sudo crontab -e

\# Tambah: 0 2 \* \* \* /usr/local/bin/backup-db.sh

```



\### 8.2 Object Storage Backup



Cloudflare R2 otomatis punya versioning. Enable di dashboard.



\---



\## 9. Update / Rollback



\### 9.1 Update



```bash

cd /var/www/sales-academy

git pull origin main

cd backend/nestjs

npm install --production

npx prisma generate

pm2 restart cimory-academy

```



\### 9.2 Rollback



```bash

cd /var/www/sales-academy

git log --oneline  # cari commit yang mau di-rollback

git checkout <commit-hash>

pm2 restart cimory-academy

```



\---



\## 10. Troubleshooting



\### Server gak jalan



```bash

pm2 logs cimory-academy

pm2 status

```



\### Database gak connect



```bash

psql $DATABASE\_URL -c "SELECT 1"

```



\### Port bentrok



```bash

sudo lsof -i :4000

sudo kill -9 <PID>

```



\### SSL expired



```bash

sudo certbot renew

sudo systemctl reload nginx

```

