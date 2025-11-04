# Deploying QR Menu to AWS

This guide walks you through a proven, production-ready deployment on AWS. It covers the simplest path (EC2 + Docker Compose + Nginx + optional TLS) and outlines alternatives (ECS Fargate, Elastic Beanstalk). The server serves the built React client in production, so you deploy a single service.

## What you’ll deploy

- Backend: Node/Express on port 5000 (serves API + built client)
- Realtime: Socket.io on the same port
- Database: MongoDB (recommended: MongoDB Atlas; optional: Dockerized Mongo on EC2)
- Reverse proxy: Nginx on EC2 for HTTP/HTTPS and TLS termination
- Persistent uploads: `server/uploads` (bind-mounted volume)

Environment variables (required):

- `NODE_ENV=production`
- `PORT=5000`
- `MONGO_URI` (Atlas or local Mongo)
- `ADMIN_KEY` (strong secret; used for dashboard/admin)
- `ALLOWED_ORIGINS` (comma-separated origins, e.g. `https://yourdomain.com`)
- `CLIENT_URL` (public site URL, e.g. `https://yourdomain.com`)

---

## Option A: EC2 + Docker Compose (recommended for small setups)

### 1) Prerequisites

- AWS account + IAM user with EC2 & Route53 permissions
- Domain (Route 53 or external)
- EC2 security group allowing: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Key pair to SSH the instance

### 2) Create EC2 instance

- AMI: Ubuntu 22.04 LTS (or Amazon Linux 2023)
- Type: t3.small (adjust per traffic)
- Storage: 30GB gp3 (increase if hosting images locally)
- Security group: open 22/80/443 to your needs

### 3) Install Docker & Compose on EC2

```bash
# Ubuntu
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
# Re-login for group to take effect
```

### 4) Get the code onto the server

- Either `git clone` your repo or copy only the needed files (Dockerfile, docker-compose.yml, deploy/nginx.conf, server/, client/, package.json, etc.)

### 5) Configure environment

Create `.env` in the project root on the EC2 instance (same dir as `docker-compose.yml`):

```dotenv
NODE_ENV=production
PORT=5000
# Use Atlas (recommended) OR local mongo service
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority&appName=<app>
ADMIN_KEY=<strong-random-secret>
CLIENT_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

If you want local Mongo (not recommended for prod), keep the `mongo` service in docker-compose and set:

```dotenv
MONGO_URI=mongodb://mongo:27017/qr-menu
```

### 6) Persist uploads (and mongo if local)

- Ensure `server/uploads` exists and is bind-mounted or a named volume if you containerize the app.
- The provided `docker-compose.yml` already mounts Mongo data to a named volume (`mongo_data`). For uploads, you can mount a host path:

```yaml
# Example addition under the app service
volumes:
  - ./server/uploads:/usr/src/app/uploads
```

### 7) Build and start with Docker Compose

```bash
# From the project directory
docker compose pull  # optional if using images
docker compose up -d --build
# Verify
docker compose ps
curl -s http://localhost:5000/ | jq .
```

You should see `{ status: 'ok', message: 'QR Menu & Order System API' }`.

### 8) Install and configure Nginx (reverse proxy)

```bash
sudo apt-get install -y nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo tee /etc/nginx/sites-available/qr-menu <<'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:5000;
    }

    # WebSocket upgrade
    location /socket.io/ {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:5000;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/qr-menu /etc/nginx/sites-enabled/qr-menu
sudo nginx -t && sudo systemctl restart nginx
```

### 9) TLS (HTTPS)

- Easiest: Let’s Encrypt certbot on the EC2 instance:

```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Auto-renewal is installed by default; verify with:
sudo certbot renew --dry-run
```

- Alternatively: Put the instance behind an AWS Application Load Balancer (ALB) with an ACM certificate and target group. Point DNS (Route 53) to the ALB, not the instance.

### 10) Environment sanity checklist

- `ALLOWED_ORIGINS` includes your final domain (and protocol): `https://yourdomain.com`
- `CLIENT_URL` set to your domain
- `ADMIN_KEY` is strong and secret
- Security group restricts SSH; 80/443 open to the internet
- Backups: If using local Mongo, set up snapshots or move to Atlas

---

## Option B: ECS Fargate (container-native)

High-level steps:

1. Build and push image to ECR (CI recommended)
2. Create an ECS Cluster (Fargate)
3. Define a Task with the app container; set env vars (MONGO_URI to Atlas)
4. Use an ALB with ACM cert; target group routes 80/443 → container port 5000
5. Add an EFS volume and mount to `/usr/src/app/uploads` if you need persistent uploads
6. Update security groups and Route 53 DNS

This removes server management, scales better, and keeps logs in CloudWatch.

---

## Option C: Elastic Beanstalk (single Docker)

1. Create a Docker-based EB application and environment
2. Supply a Dockerrun.aws.json or use the existing Dockerfile
3. Configure env vars in EB console
4. Attach an ACM certificate for HTTPS via the environment load balancer

Good for simple managed deployments without crafting ECS infra.

---

## Troubleshooting

- 4xx/5xx via Nginx: check `sudo journalctl -u nginx -e` and container logs `docker compose logs -f`
- CORS issues: ensure `ALLOWED_ORIGINS` exactly matches the browser origin(s)
- Admin dashboard access fails: verify `ADMIN_KEY` and that requests include the `slug` where required
- Images not persisting: confirm `uploads` path is mounted and has write perms inside container
- Mongo connection errors: validate `MONGO_URI` and security rules (Atlas network allow list)

---

## Post-deploy checklist

- Create an admin key and store it securely (parameter store/Secrets Manager)
- Rotate `ADMIN_KEY` from default `changeme`
- Enable CloudWatch or another log shipper for Nginx and app logs
- Configure nightly backups (Atlas snapshots or EBS snapshots)
- Set up basic monitoring (health checks, alarms on 5xx, CPU/mem)

Happy shipping! 🚀
