# Judge0 Installation Guide

## Step 1: Install Docker

### For Fedora/RHEL/CentOS
```bash
# Remove old versions (if any)
sudo dnf remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# Install Docker
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# IMPORTANT: Logout and login again for group changes to take effect
# Or run: newgrp docker
```

### For Ubuntu/Debian
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER

# IMPORTANT: Logout and login again
```

### Verify Docker Installation
```bash
# Check Docker version
docker --version

# Test Docker
docker run hello-world

# Check Docker Compose
docker compose version
```

## Step 2: Start Judge0

Once Docker is installed and you've logged out/in:

```bash
# Navigate to Judge0 directory
cd /home/vorlox/Desktop/codeLan/backend/docker/judge0

# Start Judge0 using the script
./start.sh

# OR manually:
docker compose up -d
```

## Step 3: Verify Judge0 is Running

```bash
# Check if containers are running
docker compose ps

# Should show 4 containers:
# - judge0-server
# - judge0-workers  
# - judge0-db
# - judge0-redis

# Test Judge0 API
curl http://localhost:2358/about

# Should return JSON with Judge0 information
```

## Step 4: Test with Backend

```bash
# Get a token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test_student@school.edu","password":"pass123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Check Judge0 health through backend
curl -X GET http://localhost:3000/api/code/health \
  -H "Authorization: Bearer $TOKEN"

# Execute Python code
curl -X POST http://localhost:3000/api/code/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "sourceCode": "print(\"Hello from Judge0!\")"
  }'
```

## Quick Commands Reference

```bash
# Start Judge0
cd /home/vorlox/Desktop/codeLan/backend/docker/judge0
docker compose up -d

# Stop Judge0
docker compose stop

# Restart Judge0
docker compose restart

# View logs
docker compose logs -f

# Stop and remove everything
docker compose down

# Stop and remove including data
docker compose down -v

# Check status
docker compose ps
```

## Troubleshooting

### If Docker commands require sudo:
```bash
# Make sure you're in the docker group
groups

# If 'docker' is not listed, add yourself again:
sudo usermod -aG docker $USER

# Then logout/login or run:
newgrp docker
```

### If port 2358 is in use:
Edit `docker-compose.yml` and change the port:
```yaml
ports:
  - "2359:2358"  # Use 2359 instead
```

Then update your backend `.env`:
```env
JUDGE0_URL=http://localhost:2359
```

### If containers keep restarting:
Check logs for errors:
```bash
docker compose logs judge0-server
docker compose logs judge0-workers
```

### If services are slow to start:
Wait 20-30 seconds after `docker compose up -d` for all services to initialize.

## Next Steps

1. ✅ Install Docker
2. ✅ Logout and login (for group changes)
3. ✅ Start Judge0: `./start.sh`
4. ✅ Test: `curl http://localhost:2358/about`
5. ✅ Use code execution API

You're all set! 🚀
