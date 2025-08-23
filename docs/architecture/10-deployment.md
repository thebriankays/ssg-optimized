# Deployment Guide

## Overview

This guide covers deployment strategies for the Payload CMS 3 + React Three Fiber application, including build optimization, environment configuration, and platform-specific instructions.

## Pre-Deployment Checklist

### Performance
- [ ] All images are optimized and using Next.js Image component
- [ ] 3D models are compressed with Draco
- [ ] Textures are compressed (KTX2/Basis)
- [ ] Bundle size is under budget
- [ ] Lighthouse scores meet targets
- [ ] No console errors or warnings

### Security
- [ ] Environment variables are properly configured
- [ ] API keys are restricted and secure
- [ ] CORS is properly configured
- [ ] CSP headers are set
- [ ] Database connection is secure

### Content
- [ ] All CMS content is migrated
- [ ] Media assets are uploaded
- [ ] SEO metadata is complete
- [ ] Sitemap is generated
- [ ] Robots.txt is configured

## Build Configuration

### Next.js Configuration

Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  
  // Image optimization
  images: {
    domains: ['your-domain.com', 'cdn.your-domain.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Webpack optimization
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([[\\/]|$)/
                )[1]
                return `npm.${packageName.replace('@', '')}`
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            three: {
              name: 'three',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 35,
              enforce: true,
            },
            shared: {
              name: 'shared',
              chunks: 'all',
              test: /[\\/]src[\\/]components[\\/]/,
              priority: 20,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    
    return config
  },
}

module.exports = nextConfig
```

### Environment Variables

Create `.env.production`:

```bash
# Application
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
NODE_ENV=production

# Database
DATABASE_URI=postgresql://user:pass@host:5432/db?sslmode=require

# Payload
PAYLOAD_SECRET=your-production-secret-min-32-chars
PAYLOAD_CONFIG_PATH=src/payload.config.ts

# APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-production-key

# CDN (optional)
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Feature Flags
NEXT_PUBLIC_ENABLE_WEBGL=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Platform-Specific Deployment

### Vercel

#### Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/[...slug]/route.ts": {
      "maxDuration": 30
    },
    "app/(payload)/admin/[[...segments]]/page.tsx": {
      "maxDuration": 60
    }
  },
  "env": {
    "NEXT_PUBLIC_IS_PREVIEW": "@preview"
  },
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, immutable, max-age=31536000"
        }
      ]
    },
    {
      "source": "/textures/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, immutable, max-age=31536000"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

#### Deployment Steps

```bash
# Install Vercel CLI
pnpm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URI production
vercel env add PAYLOAD_SECRET production
# ... add all required env vars
```

### Railway

#### Configuration

Create `railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install && pnpm build"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "3000"
```

#### Database Setup

```bash
# Create PostgreSQL service
railway add postgresql

# Get connection string
railway vars

# Set in your app
railway vars set DATABASE_URI=${{Postgres.DATABASE_URL}}
```

### Docker

Create `Dockerfile`:

```dockerfile
# Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args
ARG NEXT_PUBLIC_SERVER_URL
ARG DATABASE_URI

ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SERVER_URL: ${NEXT_PUBLIC_SERVER_URL}
        DATABASE_URI: ${DATABASE_URI}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URI=${DATABASE_URI}
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

## CDN Configuration

### Cloudflare

```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
}
```

### Asset Optimization

```bash
# Optimize 3D models
npx gltf-pipeline -i input.glb -o output.glb -d

# Convert textures to KTX2
npx ktx2-encoder -i texture.png -o texture.ktx2

# Generate image variants
npx @squoosh/cli --resize '{width:1920}' \
  --webp '{quality:85}' \
  --avif '{quality:80}' \
  images/*.jpg
```

## Monitoring & Analytics

### Error Tracking (Sentry)

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0]
          if (error?.type === 'ChunkLoadError') {
            return null
          }
        }
        return event
      },
    })
  }
}
```

### Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export function reportWebVitals(metric: any) {
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    })
  }
  
  // Log poor performance
  const thresholds = {
    FCP: 2500,
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    TTFB: 600,
  }
  
  if (metric.value > thresholds[metric.name]) {
    console.warn(`Poor ${metric.name}:`, metric.value)
  }
}
```

## Post-Deployment

### Health Checks

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config'

export async function GET() {
  try {
    // Check database connection
    const payload = await getPayloadHMR({ config: configPromise })
    await payload.find({
      collection: 'pages',
      limit: 1,
    })
    
    // Check critical services
    const checks = {
      database: 'healthy',
      payload: 'healthy',
      timestamp: new Date().toISOString(),
    }
    
    return NextResponse.json(checks, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 503 }
    )
  }
}
```

### Performance Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# WebPageTest
npm install -g webpagetest
webpagetest test https://your-domain.com --location Dulles:Chrome --runs 3

# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 https://your-domain.com
```

### Rollback Strategy

```bash
# Vercel
vercel rollback

# Docker
docker-compose down
docker-compose up -d --build app

# Railway
railway rollback
```

## Troubleshooting

### Common Issues

1. **Memory Issues**
   - Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096"`
   - Optimize bundle splitting
   - Implement lazy loading

2. **Build Failures**
   - Clear cache: `rm -rf .next node_modules`
   - Check environment variables
   - Review build logs

3. **Performance Issues**
   - Enable CDN for assets
   - Implement caching headers
   - Optimize database queries

4. **WebGL Issues**
   - Check GPU tier detection
   - Implement fallbacks
   - Monitor error rates

## Maintenance

### Regular Tasks

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Optimize database
- [ ] Clean up unused assets
- [ ] Review analytics data