# Docker Deployment Guide

This guide explains how to build, run, and deploy the Quran Hackathon application using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Building the Image](#building-the-image)
- [Running the Container](#running-the-container)
- [Environment Variables](#environment-variables)
- [Docker Compose](#docker-compose)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ (optional, for docker-compose.yml)
- 2GB free disk space for image
- Internet connection (for building and API access)

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at: **http://localhost:3000**

### Using Docker CLI

```bash
# Build the image
docker build -t quran-hackathon:latest .

# Run the container
docker run -d \
  --name quran-app \
  -p 3000:3000 \
  quran-hackathon:latest

# View logs
docker logs -f quran-app

# Stop the container
docker stop quran-app
docker rm quran-app
```

## Building the Image

### Standard Build

```bash
docker build -t quran-hackathon:latest .
```

### Build with Custom Tag

```bash
docker build -t quran-hackathon:v1.0.0 .
```

### Build with No Cache (Clean Build)

```bash
docker build --no-cache -t quran-hackathon:latest .
```

### Multi-Platform Build (for ARM/AMD64)

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t quran-hackathon:latest \
  --push .
```

## Running the Container

### Basic Run

```bash
docker run -d \
  --name quran-app \
  -p 3000:3000 \
  quran-hackathon:latest
```

### Run with Environment Variables

```bash
docker run -d \
  --name quran-app \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  -e PORT=3000 \
  quran-hackathon:latest
```

### Run with Custom Port

```bash
docker run -d \
  --name quran-app \
  -p 8080:3000 \
  quran-hackathon:latest
```

Access at: **http://localhost:8080**

### Run with Restart Policy

```bash
docker run -d \
  --name quran-app \
  -p 3000:3000 \
  --restart unless-stopped \
  quran-hackathon:latest
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Node environment | `production` | No |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | `""` | No |
| `GEMINI_MODEL_URL` | Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` | No |

### Setting Environment Variables

#### Via Docker Run

```bash
docker run -d \
  --name quran-app \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e PORT=3000 \
  quran-hackathon:latest
```

#### Via Environment File

Create `.env.docker`:

```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
```

Run with env file:

```bash
docker run -d \
  --name quran-app \
  -p 3000:3000 \
  --env-file .env.docker \
  quran-hackathon:latest
```

#### Via Docker Compose

Edit `docker-compose.yml`:

```yaml
services:
  quran-app:
    environment:
      - GEMINI_API_KEY=your_key_here
      - PORT=3000
```

## Docker Compose

### Configuration

The `docker-compose.yml` file includes:

- **Service**: `quran-app`
- **Port Mapping**: `3000:3000`
- **Health Check**: Automatic health monitoring
- **Restart Policy**: `unless-stopped`
- **Network**: Isolated bridge network

### Commands

```bash
# Start in detached mode
docker-compose up -d

# Start with build
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f quran-app

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Restart services
docker-compose restart

# Check service status
docker-compose ps
```

### Scaling (Not Applicable)

This application is stateless but serves a single frontend. Scaling requires a load balancer:

```bash
# Not recommended without load balancer
docker-compose up -d --scale quran-app=3
```

## Production Deployment

### Security Best Practices

1. **Don't expose unnecessary ports**
   ```bash
   # Use reverse proxy (nginx/traefik) instead of direct exposure
   docker run -d \
     --name quran-app \
     -p 127.0.0.1:3000:3000 \
     quran-hackathon:latest
   ```

2. **Use secrets for API keys**
   ```bash
   # Docker Swarm secrets
   echo "your_api_key" | docker secret create gemini_key -
   
   docker service create \
     --name quran-app \
     --secret gemini_key \
     -p 3000:3000 \
     quran-hackathon:latest
   ```

3. **Run as non-root user** (already configured in Dockerfile)

4. **Use read-only filesystem**
   ```bash
   docker run -d \
     --name quran-app \
     -p 3000:3000 \
     --read-only \
     --tmpfs /tmp \
     quran-hackathon:latest
   ```

### Resource Limits

```bash
docker run -d \
  --name quran-app \
  -p 3000:3000 \
  --memory="512m" \
  --cpus="1.0" \
  quran-hackathon:latest
```

### With Nginx Reverse Proxy

`docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  quran-app:
    build: .
    container_name: quran-app
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: quran-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - quran-app
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Health Monitoring

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' quran-app

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' quran-app
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs quran-app

# Check if port is already in use
sudo lsof -i :3000

# Run in foreground to see errors
docker run --rm -it -p 3000:3000 quran-hackathon:latest
```

### Build Failures

```bash
# Clean build with no cache
docker build --no-cache -t quran-hackathon:latest .

# Check disk space
docker system df

# Clean up unused images
docker system prune -a
```

### Application Not Accessible

```bash
# Check if container is running
docker ps

# Check container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' quran-app

# Test from inside container
docker exec -it quran-app wget -O- http://localhost:3000/health
```

### High Memory Usage

```bash
# Check resource usage
docker stats quran-app

# Set memory limits
docker update --memory="512m" quran-app
```

### API Connection Issues

```bash
# Check if container can reach external APIs
docker exec -it quran-app ping -c 3 api.quran.com

# Check DNS resolution
docker exec -it quran-app nslookup api.quran.com

# Test API endpoint
docker exec -it quran-app wget -O- https://api.quran.com/api/v4/chapters
```

### Debugging Inside Container

```bash
# Get shell access
docker exec -it quran-app sh

# Check running processes
docker exec -it quran-app ps aux

# Check environment variables
docker exec -it quran-app env

# Check file structure
docker exec -it quran-app ls -la /app
```

## Image Management

### View Images

```bash
docker images | grep quran
```

### Remove Image

```bash
docker rmi quran-hackathon:latest
```

### Tag Image

```bash
docker tag quran-hackathon:latest myregistry.com/quran-hackathon:v1.0.0
```

### Push to Registry

```bash
# Docker Hub
docker tag quran-hackathon:latest username/quran-hackathon:latest
docker push username/quran-hackathon:latest

# Private Registry
docker tag quran-hackathon:latest registry.example.com/quran-hackathon:latest
docker push registry.example.com/quran-hackathon:latest
```

## Performance Optimization

### Build Optimization

The Dockerfile uses multi-stage builds to minimize image size:

- **Stage 1**: Build Angular frontend (large, with dev dependencies)
- **Stage 2**: Production runtime (small, only built assets + Node.js)

### Runtime Optimization

- Static assets served with caching headers
- Health checks for monitoring
- Alpine Linux base image (minimal size)
- No unnecessary dependencies

## Useful Commands

```bash
# View container logs (last 100 lines)
docker logs --tail 100 quran-app

# Follow logs in real-time
docker logs -f quran-app

# Copy files from container
docker cp quran-app:/app/dist ./local-dist

# Execute command in container
docker exec quran-app node -v

# Inspect container details
docker inspect quran-app

# View container resource usage
docker stats quran-app

# Export container as tar
docker export quran-app > quran-app.tar

# Save image as tar
docker save quran-hackathon:latest > quran-image.tar

# Load image from tar
docker load < quran-image.tar
```

## Support

For issues related to:
- **Docker setup**: Check this guide
- **Application features**: See main README.md
- **API issues**: Check Quran.com API status
- **Gemini AI**: Verify API key and quotas

---

**Version**: 1.0  
**Last Updated**: May 20, 2026  
**Docker Version**: 20.10+  
**Node Version**: 20 (Alpine)
