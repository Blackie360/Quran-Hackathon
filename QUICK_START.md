# Quick Start Guide - Docker Deployment

## 🚀 Get Started in 30 Seconds

### Option 1: Docker Compose (Easiest)

```bash
# Start the application
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

**Access**: http://localhost:3000

### Option 2: Docker CLI

```bash
# Build the image
docker build -t quran-hackathon:latest .

# Run the container
docker run -d -p 3000:3000 --name quran-app quran-hackathon:latest

# View logs
docker logs -f quran-app

# Stop and remove
docker stop quran-app && docker rm quran-app
```

**Access**: http://localhost:3000

## 🔧 With Gemini AI (Optional)

### Docker Compose

Edit `docker-compose.yml`:

```yaml
environment:
  - GEMINI_API_KEY=your_api_key_here
```

Then run:

```bash
docker compose up -d
```

### Docker CLI

```bash
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  --name quran-app \
  quran-hackathon:latest
```

## 📋 Useful Commands

```bash
# Check health
curl http://localhost:3000/health

# Test API
curl http://localhost:3000/api/content-api/chapters/1

# View container status
docker ps

# View logs (last 100 lines)
docker logs --tail 100 quran-app

# Execute command in container
docker exec -it quran-app sh

# Restart container
docker restart quran-app

# Remove everything
docker compose down
docker rmi quran-hackathon:latest
```

## 🌐 Endpoints

- **Frontend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Chapters API**: http://localhost:3000/api/content-api/chapters
- **Verses API**: http://localhost:3000/api/content-api/verses/by_chapter/1
- **Search API**: http://localhost:3000/api/content-api/search

## 📚 More Information

- **Detailed Guide**: See `DOCKER.md`
- **Summary**: See `DOCKERIZATION_SUMMARY.md`
- **Application Info**: See `README.md`

## ⚠️ Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Use a different port
docker run -d -p 8080:3000 --name quran-app quran-hackathon:latest
# Access at http://localhost:8080
```

### Container Won't Start

```bash
# Check logs
docker logs quran-app

# Run in foreground to see errors
docker run --rm -it -p 3000:3000 quran-hackathon:latest
```

### Build Fails

```bash
# Clean build
docker build --no-cache -t quran-hackathon:latest .

# Clean up Docker
docker system prune -a
```

## 🎯 Production Deployment

```bash
# Build for production
docker build -t myregistry.com/quran-hackathon:v1.0.0 .

# Push to registry
docker push myregistry.com/quran-hackathon:v1.0.0

# Deploy with resource limits
docker run -d \
  -p 3000:3000 \
  --memory="512m" \
  --cpus="1.0" \
  --restart unless-stopped \
  --name quran-app \
  myregistry.com/quran-hackathon:v1.0.0
```

---

**Need Help?** Check `DOCKER.md` for comprehensive documentation.
