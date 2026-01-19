# Astro + Payload CMS Monorepo Boilerplate

A modern monorepo setup combining Astro for the frontend and Payload CMS for the backend, both deployed on Cloudflare Workers with shared D1 database and R2 storage.

## Architecture Overview

This monorepo contains two main applications:
- **`apps/astro`** - Astro frontend application
- **`apps/cms`** - Payload CMS backend (Next.js)

Both applications share the same Cloudflare D1 database and R2 storage, ensuring data consistency between the CMS and frontend.

## Prerequisites

- Node.js 18.20.2 or >=20.9.0
- pnpm 9 or 10
- Cloudflare account with Wrangler CLI installed

## Quick Start

```bash
# Clone and install dependencies
git clone <repository-url>
cd astro-payload-monorepo-boilerplate
pnpm install

# Set up environment variables (see Environment Setup below)
# Start both applications in development
pnpm run dev:cms    # Start Payload CMS (usually on localhost:3000)
pnpm run dev:astro  # Start Astro frontend (usually on localhost:4321)
```

## Environment Setup

### 1. Generate Payload Secret

Generate a secure secret for Payload CMS:

```bash
openssl rand -hex 32
```

Add this to your CMS environment variables:

```bash
# apps/cms/.env
PAYLOAD_SECRET=your_generated_secret_here
```

### 2. Create Cloudflare Resources

Use Wrangler to create the required D1 database and R2 bucket:

```bash
# Create D1 database
wrangler d1 create astro-payload-monorepo-boilerplate-prod

# Create R2 bucket
wrangler r2 bucket create astro-payload-monorepo-boilerplate-prod
```

### 3. Update Wrangler Configuration

Both `apps/astro/wrangler.jsonc` and `apps/cms/wrangler.jsonc` need to reference the same resources. Update the `database_id` and `bucket_name` in both files with the values returned from the commands above.

## Cloudflare Workers Setup

### Local Development Persistence

Wrangler is configured to use local persistence at the repository root level (`.wrangler/` directory). This ensures both Payload CMS and Astro reference the same resources when running locally.

### Worker Configuration

Both applications use identical Cloudflare bindings:

```json
{
  "d1_databases": [
    {
      "binding": "D1",
      "database_id": "your-database-id",
      "database_name": "astro-payload-monorepo-boilerplate-prod",
      "remote": true
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "astro-payload-monorepo-boilerplate-prod"
    }
  ]
}
```

## Payload CMS Setup

### Initial User Creation

When you run the CMS locally for the first time:

1. Navigate to `http://localhost:3000/admin`
2. You'll be prompted to create the first user
3. Create your admin user
4. Enable API key option for the user
5. Copy the generated API key

### API Key Configuration

Add the API key to your frontend environment:

```bash
# apps/astro/.env (or relevant environment file)
PAYLOAD_API_KEY=your_copied_api_key_here
```

### Important Notes

- **API keys are tied to the PAYLOAD_SECRET**. If you change the secret, you must regenerate the API key.
- **Production requires a new user** unless you migrate the local database to production.
- Changes to database schema require migrations before deployment.

## Database Management

### Creating Migrations

When making changes to the database schema:

```bash
cd apps/cms
pnpm run payload migrate:create
```

### Applying Migrations

- **Local development**: Changes are applied automatically
- **Production**: Migrations are applied automatically during deployment via the deploy script

### Database Migration Commands

```bash
# Create new migration
cd apps/cms
pnpm run payload migrate:create

# Apply migrations locally (usually automatic)
pnpm run payload migrate

# Deploy with database migrations
pnpm run deploy
```

## Payload Live Preview

### Preview Routes

The CMS includes specific preview routes for live preview functionality. These routes handle authentication differently from the main CMS due to domain origin restrictions when using Cloudflare Workers domains.

### Authentication Challenge

- **Issue**: Cookie-based authentication doesn't work properly with Cloudflare Workers domains due to cross-origin restrictions
- **Current Solution**: API key-based authentication for preview routes
- **Future Improvement**: Implement domain-specific authentication (cookie auth for custom domains, API auth for Workers domains)

### TODO: Preview Route Improvements

- Better error handling for API key and secret issues in preview routes
- Domain-aware authentication switching
- Improved debugging capabilities for preview authentication failures

## Deployment

### Worker Naming

Before deployment, rename both workers to match your project:

1. Update `name` in `apps/astro/wrangler.jsonc`
2. Update `name` in `apps/cms/wrangler.jsonc`
3. Ensure both reference the same D1 and R2 resources

### Deployment Commands

```bash
# Deploy CMS (Payload)
pnpm run deploy:cms

# Deploy Astro frontend
pnpm run deploy:astro

# Or deploy both from root
pnpm run deploy:cms && pnpm run deploy:astro
```

### Environment-Specific Deployment

Use environment variables for different deployment targets:

```bash
CLOUDFLARE_ENV=staging pnpm run deploy:cms
CLOUDFLARE_ENV=staging pnpm run deploy:astro
```

## Data Migration

### Local to Production

To migrate local database and R2 content to production:

```bash
# Export local D1 database
wrangler d1 export astro-payload-monorepo-boilerplate-prod --local

# Import to production D1
wrangler d1 import astro-payload-monorepo-boilerplate-prod --remote <export-file>

# Sync R2 bucket (using rclone or similar)
rclone sync .wrangler/r2/buckets/your-bucket-name r2:your-bucket-name
```

### Production to Local

To migrate production data back to local:

```bash
# Export production D1 database
wrangler d1 export astro-payload-monorepo-boilerplate-prod --remote

# Import to local D1
wrangler d1 import astro-payload-monorepo-boilerplate-prod --local <export-file>

# Sync R2 bucket
rclone sync r2:your-bucket-name .wrangler/r2/buckets/your-bucket-name
```

## Development Workflow

### 1. Schema Changes

```bash
# 1. Modify your collections/globals in apps/cms/src/
# 2. Generate new types
cd apps/cms
pnpm run generate:types

# 3. Create migration if needed
pnpm run payload migrate:create

# 4. Test locally
pnpm run dev
```

### 2. Frontend Development

```bash
# Start frontend development
pnpm run dev:astro

# Generate types after CMS changes
cd apps/cms && pnpm run generate:types
```

### 3. Testing

```bash
# Run tests for CMS
cd apps/cms
pnpm run test

# Type checking
cd apps/cms
npx tsc --noEmit
```

## Project Structure

```
astro-payload-monorepo-boilerplate/
├── apps/
│   ├── astro/                 # Astro frontend
│   │   ├── src/
│   │   ├── wrangler.jsonc     # Cloudflare Workers config
│   │   └── package.json
│   └── cms/                   # Payload CMS (Next.js)
│       ├── src/
│       │   ├── collections/   # Payload collections
│       │   ├── globals/       # Payload globals
│       │   ├── app/          # Next.js app routes
│       │   └── payload.config.ts
│       ├── wrangler.jsonc    # Cloudflare Workers config
│       └── package.json
├── .wrangler/                # Local Cloudflare resources
├── package.json              # Root package.json
├── pnpm-workspace.yaml      # pnpm workspace config
└── README.md
```

## Common Issues & Solutions

### API Key Authentication Failures

- **Symptom**: Preview routes not working, API calls failing
- **Solution**: Verify PAYLOAD_SECRET matches between environments and regenerate API key if needed

### Database Migration Issues

- **Symptom**: Deployments failing with database errors
- **Solution**: Ensure migrations are created and applied before schema changes

### R2 Upload Issues

- **Symptom**: Media uploads failing in CMS
- **Solution**: Verify R2 bucket configuration and permissions

## Scripts Reference

### Root Level Scripts

- `pnpm run dev:astro` - Start Astro development server
- `pnpm run dev:cms` - Start Payload CMS development server
- `pnpm run deploy:astro` - Deploy Astro to Cloudflare Workers
- `pnpm run deploy:cms` - Deploy Payload CMS to Cloudflare Workers

### CMS Scripts

- `pnpm run dev` - Start Next.js development server
- `pnpm run build` - Build for production
- `pnpm run deploy` - Deploy to Cloudflare Workers
- `pnpm run generate:types` - Generate TypeScript types
- `pnpm run payload migrate:create` - Create new migration
- `pnpm run payload migrate` - Apply migrations

### Astro Scripts

- `pnpm run dev` - Start Astro development server
- `pnpm run build` - Build for production
- `pnpm run deploy` - Deploy to Cloudflare Workers
- `pnpm run cf-typegen` - Generate Cloudflare types

## Security Considerations

- Always use strong, unique `PAYLOAD_SECRET` values
- Rotate API keys if secret is compromised
- Use environment-specific secrets for production
- Regularly update dependencies
- Monitor Cloudflare Workers for unusual activity

## Future Improvements

### Preview Authentication
- Domain-aware authentication switching
- Better error handling and debugging
- Automatic fallback mechanisms

### Database Management
- Automated backup scripts
- Migration rollback capabilities
- Database seeding utilities

### Development Experience
- Hot reloading for type generation
- Improved local development tooling
- Better error messages and debugging tools