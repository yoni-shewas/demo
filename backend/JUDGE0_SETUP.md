# Judge0 Docker Setup Guide

## Overview
Judge0 is a robust and scalable open-source online code execution system. This guide shows how to set up Judge0 locally using Docker for safe code execution.

## 🐳 Docker Setup

### Prerequisites
- Docker installed on your system
- Docker Compose installed
- At least 2GB RAM available
- Port 2358 available (or configure different port)

### Quick Setup

#### 1. Create Judge0 Directory
```bash
mkdir judge0
cd judge0
```

#### 2. Download Docker Compose Configuration
```bash
# Download the official Judge0 docker-compose.yml
wget https://github.com/judge0/judge0/releases/download/v1.13.0/judge0-v1.13.0.zip
unzip judge0-v1.13.0.zip
cd judge0-v1.13.0
```

Or create a custom `docker-compose.yml`:

```yaml
version: '3.7'

x-logging: &default-logging
  logging:
    driver: json-file
    options:
      max-size: 100m

services:
  server:
    image: judge0/judge0:1.13.0
    volumes:
      - ./judge0.conf:/judge0.conf:ro
    ports:
      - "2358:2358"
    privileged: true
    <<: *default-logging
    restart: always

  workers:
    image: judge0/judge0:1.13.0
    command: ["./scripts/workers"]
    volumes:
      - ./judge0.conf:/judge0.conf:ro
    privileged: true
    <<: *default-logging
    restart: always

  db:
    image: postgres:13
    env_file: judge0.conf
    volumes:
      - postgres-data:/var/lib/postgresql/data/
    <<: *default-logging
    restart: always

  redis:
    image: redis:6
    command: [
      "bash", "-c",
      'docker-entrypoint.sh --appendonly yes --requirepass "$$REDIS_PASSWORD"'
    ]
    env_file: judge0.conf
    volumes:
      - redis-data:/data
    <<: *default-logging
    restart: always

volumes:
  postgres-data:
  redis-data:
```

#### 3. Create Configuration File
Create `judge0.conf`:

```bash
# Database
POSTGRES_HOST=db
POSTGRES_DB=judge0
POSTGRES_USER=judge0
POSTGRES_PASSWORD=YourSecurePassword

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=YourSecureRedisPassword
REDIS_PORT=6379

# Judge0 Configuration
JUDGE0_VERSION=1.13.0
JUDGE0_HOMEPAGE=http://localhost:2358

# Security
ENABLE_WAIT_RESULT=true
ENABLE_COMPILER_OPTIONS=false
ALLOWED_LANGUAGES_FOR_COMPILE_OPTIONS=

# Limits
MAX_QUEUE_SIZE=100
MAX_JOBS_IN_QUEUE=30
MAX_CPU_TIME_LIMIT=15
MAX_MAX_PROCESSES_AND_OR_THREADS=120
MAX_MEMORY_LIMIT=512000
MAX_STACK_LIMIT=128000
MAX_OUTPUT_SIZE=10240
MAX_EXTRACTION_SIZE=10240
MAX_FILE_SIZE=1024
NUMBER_OF_RUNS=1

# Enable specific languages (optional)
ENABLE_ADDITIONAL_FILES=false
ENABLE_BATCHED_RUNS=false
ENABLE_CALLBACKS=false
```

#### 4. Start Judge0 Services
```bash
# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f server
```

#### 5. Verify Installation
```bash
# Test Judge0 API
curl http://localhost:2358/about

# Should return JSON with Judge0 information
```

### Alternative: Single Container Setup (Simpler)

For development/testing, you can use a simpler single-container setup:

```bash
# Run Judge0 in a single container (less robust but easier)
docker run \
  --name judge0 \
  -p 2358:2358 \
  --privileged \
  -d \
  judge0/judge0:1.13.0
```

## 🔧 Configuration

### Environment Variables for Backend

Add to your backend `.env` file:

```env
# Judge0 Configuration
JUDGE0_URL=http://localhost:2358
JUDGE0_API_KEY=
```

### Security Considerations

1. **Privileged Mode**: Judge0 requires privileged mode for sandboxing
2. **Network Isolation**: Run Judge0 on isolated network in production
3. **Resource Limits**: Configure appropriate CPU/memory limits
4. **API Key**: Use API key authentication in production

### Production Setup

For production deployment:

```yaml
# docker-compose.prod.yml
version: '3.7'

services:
  server:
    image: judge0/judge0:1.13.0
    volumes:
      - ./judge0.conf:/judge0.conf:ro
    ports:
      - "127.0.0.1:2358:2358"  # Bind to localhost only
    privileged: true
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  # ... other services
```

## 🧪 Testing Judge0

### Test Basic Functionality

```bash
# Test with simple Python code
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 71,
    "source_code": "print(\"Hello, World!\")",
    "stdin": ""
  }'

# Get result (replace TOKEN with returned token)
curl http://localhost:2358/submissions/TOKEN
```

### Test from Backend

```bash
# Test through your backend API
curl -X POST http://localhost:3000/api/code/run \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "sourceCode": "print(\"Hello from backend!\")"
  }'
```

## 📊 Supported Languages

Judge0 supports 60+ programming languages. Common ones include:

| Language | ID | Example Extension |
|----------|----|--------------------|
| C | 50 | `.c` |
| C++ | 54 | `.cpp` |
| Python 3 | 71 | `.py` |
| Java | 62 | `.java` |
| JavaScript | 63 | `.js` |
| PHP | 68 | `.php` |
| Ruby | 72 | `.rb` |
| Go | 60 | `.go` |
| Rust | 73 | `.rs` |
| Kotlin | 78 | `.kt` |

## 🔍 Monitoring & Maintenance

### Health Checks

```bash
# Check Judge0 health
curl http://localhost:2358/about

# Check database connection
docker-compose exec db psql -U judge0 -d judge0 -c "SELECT version();"

# Check Redis connection
docker-compose exec redis redis-cli ping
```

### Logs and Debugging

```bash
# View server logs
docker-compose logs -f server

# View worker logs
docker-compose logs -f workers

# View all logs
docker-compose logs -f
```

### Cleanup and Maintenance

```bash
# Clean up old submissions (run periodically)
docker-compose exec db psql -U judge0 -d judge0 -c "DELETE FROM submissions WHERE created_at < NOW() - INTERVAL '7 days';"

# Restart services
docker-compose restart

# Update to latest version
docker-compose pull
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 2358
sudo lsof -i :2358

# Use different port in docker-compose.yml
ports:
  - "2359:2358"
```

#### 2. Permission Denied
```bash
# Ensure Docker has proper permissions
sudo usermod -aG docker $USER
# Logout and login again
```

#### 3. Services Not Starting
```bash
# Check logs for errors
docker-compose logs

# Check system resources
docker system df
docker system prune  # Clean up if needed
```

#### 4. Slow Execution
```bash
# Increase worker count in judge0.conf
MAX_JOBS_IN_QUEUE=50

# Allocate more resources
docker-compose up -d --scale workers=3
```

### Performance Tuning

```bash
# judge0.conf optimizations for better performance
MAX_QUEUE_SIZE=200
MAX_JOBS_IN_QUEUE=50
NUMBER_OF_RUNS=3

# Docker resource limits
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 4G
```

## 🔐 Security Best Practices

1. **Firewall**: Block external access to Judge0 port
2. **API Key**: Use authentication in production
3. **Resource Limits**: Prevent resource exhaustion
4. **Network Isolation**: Use Docker networks
5. **Regular Updates**: Keep Judge0 updated
6. **Monitoring**: Monitor resource usage and logs

## 📝 Integration with Backend

Your backend automatically integrates with Judge0 when:

1. Judge0 is running on `http://localhost:2358`
2. Environment variables are configured
3. Network connectivity is available

The backend will:
- ✅ Submit code to Judge0
- ✅ Poll for results
- ✅ Handle errors gracefully
- ✅ Log execution details
- ✅ Return formatted results

## 🎯 Next Steps

1. **Start Judge0**: Follow setup instructions above
2. **Test Connection**: Use health check endpoint
3. **Run Sample Code**: Test with provided examples
4. **Monitor Performance**: Check logs and metrics
5. **Scale if Needed**: Add more workers for high load

Judge0 is now ready to safely execute student code submissions! 🚀
