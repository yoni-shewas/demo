# Judge0 Local Docker Setup

This directory contains a simple Judge0 Docker Compose setup for local development.

## 🚀 Quick Start

### Prerequisites
- Docker installed
- Docker Compose installed
- At least 2GB RAM available

### Start Judge0

```bash
# Navigate to this directory
cd docker/judge0

# Start Judge0 services
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f judge0-server
```

### Verify Judge0 is Running

```bash
# Check Judge0 API
curl http://localhost:2358/about

# Should return JSON with Judge0 information
```

### Test Code Execution

```bash
# Test with Python code
curl -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 71,
    "source_code": "print(\"Hello from Judge0!\")",
    "stdin": ""
  }'

# You will get a response with a token, e.g., {"token":"abc123"}

# Get the result (replace TOKEN with the actual token)
curl http://localhost:2358/submissions/TOKEN?base64_encoded=false
```

## 📋 Services

The Docker Compose setup includes:

- **judge0-server**: Main Judge0 API server (port 2358)
- **judge0-workers**: Background workers for code execution
- **judge0-db**: PostgreSQL database
- **judge0-redis**: Redis cache for queue management

## 🛠️ Management Commands

### Stop Services
```bash
docker-compose stop
```

### Restart Services
```bash
docker-compose restart
```

### Stop and Remove All Containers
```bash
docker-compose down
```

### Stop and Remove All Data (INCLUDING DATABASE)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f judge0-server
docker-compose logs -f judge0-workers
```

### Check Service Status
```bash
docker-compose ps
```

## 🔧 Configuration

Edit `judge0.conf` to change:
- Database credentials
- Redis password
- Resource limits (CPU time, memory, etc.)
- Queue settings

After changing configuration:
```bash
docker-compose restart
```

## 🧪 Test with Backend

Once Judge0 is running, test through your backend:

```bash
# Check health
curl -X GET http://localhost:3000/api/code/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Execute code
curl -X POST http://localhost:3000/api/code/run \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "sourceCode": "print(\"Hello from backend!\")"
  }'
```

## 📊 Supported Languages

Judge0 supports 60+ programming languages including:
- C, C++, Java, Python, JavaScript
- PHP, Ruby, Go, Rust, Kotlin
- Swift, C#, and many more

Full list: https://github.com/judge0/judge0/blob/master/CHANGELOG.md

## 🐛 Troubleshooting

### Port Already in Use
If port 2358 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "2359:2358"  # Use port 2359 instead
```

Then update your backend `.env`:
```env
JUDGE0_URL=http://localhost:2359
```

### Services Not Starting
Check logs for errors:
```bash
docker-compose logs
```

Check available resources:
```bash
docker system df
```

### Database Connection Issues
Reset the database:
```bash
docker-compose down -v
docker-compose up -d
```

### Slow Execution
Allocate more resources in `judge0.conf`:
```conf
MAX_QUEUE_SIZE=200
MAX_JOBS_IN_QUEUE=50
```

## 🔒 Security Notes

- This setup is for **local development only**
- For production:
  - Change default passwords in `judge0.conf`
  - Bind to localhost only: `127.0.0.1:2358:2358`
  - Use API key authentication
  - Run behind a reverse proxy

## 📚 Resources

- Judge0 GitHub: https://github.com/judge0/judge0
- Judge0 Documentation: https://ce.judge0.com/
- Judge0 API Docs: https://ce.judge0.com/#submissions-submission

## 🎯 Next Steps

1. ✅ Start Judge0: `docker-compose up -d`
2. ✅ Verify: `curl http://localhost:2358/about`
3. ✅ Test backend: Check health endpoint
4. ✅ Execute code: Run sample code through backend

Judge0 is now ready for local code execution! 🚀
