# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

The Huly Platform is a monorepo for building business applications (CRM, HRM, ATS, Project Management, Chat) using a plugin-based architecture. It uses Rush for monorepo management with pnpm as the package manager.

## Build System & Commands

### Initial Setup

**Authentication Required**: Before installation, authenticate with GitHub Packages:
```bash
npm login --registry=https://npm.pkg.github.com
```
Use your GitHub username and a personal access token (with `read:packages` scope) as the password.

**Submodule Initialization**:
```bash
git submodule init
git submodule update
```

**Installation**:
```bash
npm install -g @microsoft/rush
rush install
rush build
```

Or use the fast-start script: `sh ./scripts/fast-start.sh`

### Core Rush Commands

- `rush build` - Incremental build of all packages
- `rush rebuild` - Clean build (ignores cache)
- `rush validate` - TypeScript validation and .d.ts generation
- `rush bundle` - Create webpack bundles for frontend packages
- `rush package` - Package applications for deployment
- `rush test` - Run unit tests
- `rush build:watch` - Build and watch for changes

### Development Workflow

**Development Server** (for frontend work):
```bash
cd dev/prod
rush validate
rushx dev-server
```
Then access http://localhost:8080

**Docker Development Environment**:
```bash
cd dev/
rush docker:build    # Builds containers (includes build, bundle, package phases)
rush docker:up       # Starts all services
```

Add to `/etc/hosts`: `127.0.0.1 huly.local` and `::1 huly.local`
Access at: http://huly.local:8087

**Local MongoDB Setup**:
```bash
rush docker:local     # Start local MongoDB stack
rush tool:upgrade     # Upgrade database models
```

### Testing

**Unit Tests**:
```bash
rush test              # All tests
rushx test             # Single package (run from package directory)
```

**UI Tests**:
```bash
cd ./tests
rush build
rush bundle
rush docker:build
./prepare.sh           # Create test containers
rushx uitest           # Run UI tests

# For development environment:
./create-local.sh      # Initial setup
./restore-local.sh     # Reset to initial state
cd ./sanity
rushx dev-uitest       # Run all tests
rushx dev-debug -g 'pattern'  # Debug specific tests
```

### Formatting & Linting

```bash
rush format              # Format all changed files
rush doformat            # Format and show errors
rush fast-format         # Format only changed projects
rush fast-format -b <branch>  # Format changes since branch
```

### Troubleshooting

**Clear build cache**:
```bash
rm -rf common/temp/build-cache
```

**Clean TypeScript cache**:
```bash
rush ts-clean          # Remove tsconfig.tsbuildinfo files
rush revalidate        # Clean and re-validate
```

**Dependency issues**:
```bash
rush update            # Relink dependencies
rush deps-clean        # Clean dependency cache
```

## Architecture

### Repository Structure

The monorepo is organized into functional directories:

- **packages/** - Core shared packages (UI components, themes, presentation layer, clients)
- **plugins/** - Feature plugins (frontend) organized as triplets:
  - `<name>/` - Core plugin logic
  - `<name>-assets/` - Static assets
  - `<name>-resources/` - UI resources (Svelte components)
- **models/** - Data model definitions (client and server)
- **server/** - Core server infrastructure (account, workspace, collaborator, front, backup)
- **server-plugins/** - Server-side plugin implementations
- **pods/** - Deployable service containers (microservices)
- **services/** - Specific service implementations (gmail, telegram, calendar, datalake, etc.)
- **dev/** - Development tools and configurations
- **tests/** - UI and integration tests
- **ws-tests/** - WebSocket/API tests
- **desktop/** - Electron desktop application
- **templates/** - Package.json templates for consistency

### Plugin Architecture

Plugins follow a three-part structure:

1. **Core Plugin** (`plugins/<name>/`): Defines interfaces, types, and business logic
2. **Assets** (`plugins/<name>-assets/`): Images, icons, translations
3. **Resources** (`plugins/<name>-resources/`): Svelte UI components and implementations

Server plugins follow a similar pattern in `server-plugins/<name>/`.

### Model System

Models define the data schema and are split between:
- Client models (`models/<name>/`) - Define client-side data structures
- Server models (`models/server-<name>/`) - Define server-side behaviors and triggers

The `models/all/` package aggregates all models for production builds.

### Service Architecture (Pods)

Services are deployed as containerized pods with specific responsibilities:
- **front** - Frontend web server
- **account** - User account management
- **workspace** - Workspace operations and backup
- **server** - Main transactor service (business logic)
- **collaborator** - Real-time collaboration (Y.js/websockets)
- **fulltext** - Elasticsearch integration
- **backup** - Backup and restore operations
- **datalake** - Blob storage gateway (wraps MinIO)
- **hulylake** - Data lake API
- **hulykvs** - Key-value store
- **hulypulse** - Real-time messaging (Redis-based)
- **media** - Media processing
- **preview** - Document preview generation

### Technology Stack

- **Frontend**: Svelte, TypeScript, Webpack
- **Backend**: Node.js, TypeScript
- **Databases**: CockroachDB (primary), MongoDB (legacy), Elasticsearch (search)
- **Message Queue**: Redpanda (Kafka-compatible)
- **Storage**: MinIO (S3-compatible)
- **Real-time**: Redis (hulypulse), WebSockets
- **Build System**: Rush + pnpm
- **Testing**: Playwright (UI tests), standard test frameworks

### Branch Strategy

- **develop** (default) - Active development, use for contributions
- **staging** - Pre-release testing
- **main** - Production-ready releases

## Development Patterns

### Adding a New Plugin

1. Create three packages: `plugins/<name>/`, `plugins/<name>-assets/`, `plugins/<name>-resources/`
2. Add corresponding model: `models/<name>/`
3. Add server plugin if needed: `server-plugins/<name>/`, `models/server-<name>/`
4. Register in `rush.json` projects list
5. Run `rush update` to link dependencies

### Working with Models

Models use a declarative approach. Changes to models typically require:
```bash
cd dev/tool
rushx run-local upgrade -f  # Upgrade database with model changes
```

### Package Templates

Use template system for consistency:
```bash
rush apply-templates  # Update all package.json files to match templates
```

Templates are defined in the `templates/` directory.

### Docker Development

Environment variables are configured via `.env` in `dev/` directory:
- `DB_CR_URL` - CockroachDB connection string
- `QUEUE_CONFIG` - Kafka/Redpanda configuration
- `STORAGE_CONFIG` - MinIO storage configuration
- `BACKUP_STORAGE_CONFIG` - Backup storage configuration

### Desktop Application

Build desktop app:
```bash
rush desktop  # Builds and packages desktop application
cd desktop-package
rushx dist    # Create distribution packages
```

## Common Issues

### Docker on WSL

If running on WSL with source on NTFS:
- Add to `/etc/wsl.conf`:
  ```ini
  [automount]
  enabled = true
  root = /mnt/
  options = "metadata,umask=22,fmask=11"

  [interop]
  appendWindowsPath = false
  ```
- Recommended: Store repo on WSL filesystem for better performance

### Port Conflicts

Default ports used (configurable in `dev/docker-compose.yaml`):
- 8087 - Frontend (front)
- 3000 - Account service
- 3332 - Transactor (main server)
- 3078 - Collaborator
- 9200 - Elasticsearch
- 9000/9001 - MinIO
- 26257 - CockroachDB
- 19092 - Redpanda (Kafka)
- 6379 - Redis

### Build Performance

For faster builds:
- Use `rush build:watch` during development
- Limit parallelism: `rush build -p 10` (reduces CPU/memory usage)
- Clear build cache if experiencing issues: `rm -rf common/temp/build-cache`

## Additional Commands & Tools

### Model Management

```bash
rush model-version      # Show current model version
rush show-model         # Display model structure
```

### Development Tools

```bash
rush apply-templates    # Update all package.json files from templates
rush update-deps        # Update published dependencies to latest versions
rush desktop           # Build desktop application
```

### Package Publishing

```bash
node ./common/scripts/bump.js -p projectName  # Bump package version
```

### Docker & Deployment

```bash
rush docker:push       # Push Docker release images
rush docker:staging    # Build staging containers
```

## Environment Configuration

### Required Environment Variables

The development environment uses several key environment variables (typically in `dev/.env`):

- **DB_CR_URL** - CockroachDB connection string
- **QUEUE_CONFIG** - Redpanda/Kafka configuration
- **STORAGE_CONFIG** - MinIO S3-compatible storage
- **BACKUP_STORAGE_CONFIG** - Backup storage settings
- **ELASTIC_URL** - Elasticsearch connection

### Service URLs

Development services run on default ports:
- **Frontend**: http://localhost:8080 (dev) or http://huly.local:8087 (Docker)
- **Account Service**: http://localhost:3000
- **Main Server**: http://localhost:3332
- **Collaboration**: http://localhost:3078

## Key Development Files

- **rush.json** - Main Rush configuration and project inventory
- **common/config/rush/command-line.json** - Custom Rush commands and phases
- **dev/docker-compose.yaml** - Docker development environment
- **templates/** - Package.json templates for consistency
- **common/scripts/** - Build and utility scripts

## Plugin Development Patterns

### Frontend Plugin Structure
```
plugins/my-plugin/          # Core logic, types, interfaces
plugins/my-plugin-assets/   # Static assets, images, translations
plugins/my-plugin-resources/ # Svelte components, UI implementation
```

### Server Plugin Structure
```
server-plugins/my-plugin/           # Server-side logic
models/server-my-plugin/           # Server data models
server-plugins/my-plugin-resources/ # Server UI components
```

### Model Integration
- Client models in `models/my-plugin/`
- Server models in `models/server-my-plugin/`
- Aggregated in `models/all/` for production

## API Client

The repository includes a typed API client at `packages/api-client/`. See the [API Client README](./packages/api-client/README.md) for programmatic interaction with Huly.

Examples: https://github.com/hcengineering/huly-examples
