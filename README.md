# OkongzINC - Marketplace Profit Calculator

A comprehensive marketplace profit calculator for Indonesian e-commerce sellers (Tokopedia, Shopee, Lazada, TikTok Shop) with integrated DeepL translation capabilities.

## Features

### 🧮 Marketplace Calculator
- **Dual Mode Calculation**: Marketplace Price (store) & Live Selling Price (live streaming)
- **4 Marketplace Support**: Tokopedia, Shopee, Lazada, TikTok Shop
- **Real-time Fee Breakdown**: Platform commission, dynamic commission, mall fees, logistics, AMS, ads, free shipping promos, PPh 22 tax
- **Profit Analysis**: Net profit, margin percentage, marketplace deduction vs seller cost breakdown
- **Category-specific Fees**: Different commission rates per product category
- **Preset Templates**: Save and reuse calculation configurations

### 🌐 Translation Feature
- **DeepL API Integration**: High-quality neural machine translation
- **5 Languages**: Indonesian, English, Chinese (中文), Japanese (日本語), Korean (한국어)
- **Translation History**: Persistent history with copy/reuse functionality
- **Auto-detect Source Language**: Smart language detection

### 🔐 Authentication & User Management
- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days)
- **OAuth Support**: Google & GitHub (ready for configuration)
- **Secure Password**: Argon2id hashing
- **Session Management**: Redis-backed token storage

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Dark/Light Theme**: System preference detection
- **Indonesian Localization**: Full Bahasa Indonesia support
- **Accessible Components**: WCAG 2.1 AA compliant

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TanStack Router** (type-safe routing)
- **TanStack Query** (server state management)
- **React Hook Form** + **Zod** (form validation)
- **Tailwind CSS** + **Headless UI** (styling)
- **Framer Motion** (animations)
- **i18next** (internationalization)
- **Zustand** (client state)

### Backend
- **Fastify** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **Redis** (caching, sessions, rate limiting)
- **JWT** + **JOS** (authentication)
- **Zod** (validation)
- **OpenAPI/Swagger** (API documentation)

### Infrastructure
- **Docker** + **Docker Compose** (local development)
- **Kubernetes** + **Kustomize** (production deployment)
- **GitHub Actions** (CI/CD)
- **Cloudflare** (CDN, DNS, SSL)

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)

### Local Development

1. **Clone and install**
```bash
git clone https://github.com/jokoprianto612-lang/mp-calculator.git
cd mp-calculator
pnpm install
```

2. **Configure environment**
```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit with your settings (database, redis, JWT secrets, DeepL API key)
```

3. **Start with Docker Compose**
```bash
pnpm docker:up
```

4. **Run database migrations**
```bash
pnpm db:migrate
```

5. **Start development servers**
```bash
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:3000
- API Docs: http://localhost:3000/docs

### Manual Setup (without Docker)

1. **Start PostgreSQL & Redis**
```bash
# PostgreSQL
createdb mp_calculator
# Run migrations
cd apps/api && pnpm db:migrate

# Redis
redis-server
```

2. **Start API**
```bash
cd apps/api
pnpm dev
```

3. **Start Web**
```bash
cd apps/web
pnpm dev
```

## Project Structure

```
mp-calculator/
├── apps/
│   ├── api/                 # Fastify backend
│   │   ├── src/
│   │   │   ├── config.ts    # Environment config
│   │   │   ├── index.ts     # App entry point
│   │   │   ├── lib/         # Prisma, Redis, JWT, Password
│   │   │   ├── plugins/     # Fastify plugins
│   │   │   ├── routes/      # API routes
│   │   │   ├── services/    # Business logic
│   │   │   └── utils/       # Error handling
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   │
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── routes/      # TanStack Router routes
│       │   ├── stores/      # Zustand stores
│       │   ├── guards/      # Route guards
│       │   ├── locales/     # i18n translations
│       │   └── styles/      # Global styles
│       └── public/
│
├── packages/
│   └── shared/              # Shared types & logic
│       ├── src/
│       │   ├── types.ts         # TypeScript types
│       │   ├── fee-engine.ts    # Calculation engine
│       │   ├── validation.ts    # Zod schemas
│       │   └── utils.ts         # Utilities
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── nginx.conf
│
├── k8s/
│   ├── base/                # Base K8s manifests
│   └── overlays/            # Environment overlays
│       ├── dev/
│       ├── staging/
│       └── prod/
│
├── .github/workflows/       # CI/CD pipelines
└── docs/                    # Documentation
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) |
| GET | `/api/v1/auth/me` | Get current user |
| PATCH | `/api/v1/auth/me` | Update profile |
| POST | `/api/v1/auth/change-password` | Change password |

### Calculations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/calculations` | Create & save calculation |
| GET | `/api/v1/calculations` | List user calculations |
| GET | `/api/v1/calculations/:id` | Get calculation detail |
| PATCH | `/api/v1/calculations/:id` | Update calculation |
| DELETE | `/api/v1/calculations/:id` | Delete calculation |
| POST | `/api/v1/calculations/:id/duplicate` | Duplicate calculation |
| POST | `/api/v1/calculations/preview` | Preview calculation (no save) |

### Presets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/presets` | Create preset |
| GET | `/api/v1/presets` | List presets |
| GET | `/api/v1/presets/:id` | Get preset |
| PATCH | `/api/v1/presets/:id` | Update preset |
| DELETE | `/api/v1/presets/:id` | Delete preset |

### Translation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/translate` | Translate text |
| GET | `/api/v1/translate/languages` | Get supported languages |

### Marketplaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/marketplaces` | List supported marketplaces |
| GET | `/api/v1/marketplaces/:id/fees` | Get fee structure |

## Fee Calculation Details

### Supported Marketplaces & Fee Structures

#### Tokopedia
- Platform Commission: 2.5%
- Dynamic Commission: 2-4.5% (by category)
- Mall Service Fee: 1%
- Order Processing: Rp1,250
- Logistics: Base Rp5,000 + Rp2,500/kg
- AMS Commission: 3%
- PPh 22 Tax: 0.5%
- Free Shipping Programs: XTRA (1.5%), Spesial (2%)
- Promo Programs: Promo Xtra (1%), Flash Sale (1.5%)

#### Shopee
- Platform Commission: 3%
- Dynamic Commission: 2.5-5% (by category)
- Mall Service Fee: 1.5%
- Order Processing: Rp1,500
- Logistics: Base Rp4,000 + Rp3,000/kg
- AMS Commission: 4%
- PPh 22 Tax: 0.5%
- Free Shipping: Gratis Ongkir (1.2%), Gratis Ongkir Plus (1.8%)
- Promo: Shopee Promo (1.2%), Mall Promo (1.5%)

#### Lazada
- Platform Commission: 2%
- Dynamic Commission: 1.5-4% (by category)
- Mall Service Fee: 0.8%
- Order Processing: Rp1,000
- Logistics: Base Rp6,000 + Rp2,000/kg
- AMS Commission: 2.5%
- PPh 22 Tax: 0.5%
- Free Shipping: Lazada Free Shipping (1%), Plus (1.5%)
- Promo: Lazada Promo (0.8%), Mall Promo (1%)

#### TikTok Shop
- Platform Commission: 1.5%
- Dynamic Commission: 1-3.5% (by category)
- Mall Service Fee: 0.5%
- Order Processing: Rp500
- Logistics: Base Rp3,000 + Rp1,500/kg
- AMS Commission: 5%
- PPh 22 Tax: 0.5%
- Free Shipping: TikTok Free Shipping (0.8%), Live (1.2%)
- Promo: Live Promo (1%), Shop Promo (1.5%)

### Calculation Formula

```
Net Sale = Selling Price - Seller Voucher - Platform Voucher

Marketplace Deductions:
  = Platform Fee + Dynamic Fee + Mall Fee + Processing Fee
    + Logistics Fee + AMS Fee + Free Shipping Fee + Promo Fee + Tax Fee

Seller Costs:
  = HPP + Packing Cost + Ad Budget + Seller Voucher + Promo Fee

Net Profit = Net Sale - Marketplace Deductions - Seller Costs
Profit Margin = (Net Profit / Net Sale) × 100
```

## Deployment

### Docker Production Build
```bash
# Build images
pnpm docker:build

# Run production stack
docker compose -f docker/docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
# Development
kubectl apply -k k8s/overlays/dev

# Staging
kubectl apply -k k8s/overlays/staging

# Production
kubectl apply -k k8s/overlays/prod
```

### Cloudflare Pages (Web only)

The web app is self-contained and deployable to Cloudflare Pages without the API server (calculator uses local fee engine).

**Dashboard configuration:**
- **Branch to deploy:** `feature/web-redesign`
- **Build command:**
  ```bash
  pnpm install --no-frozen-lockfile && pnpm --filter @mp-calculator/web run build
  ```
- **Build output directory:** `apps/web/dist`
- **Root directory:** *(leave empty / blank)*
- **Environment variables:**
  - `VITE_API_URL` — leave empty (offline mode) or set to API URL
  - `NODE_VERSION` — `20`
  - `SKIP_DEPENDENCY_INSTALL=1` — **recommended**: disables CF Pages' auto `bun install` so pnpm handles everything from scratch (fixes `@mp-calculator/shared` 404 caused by bun→pnpm workspace symlink corruption)

**Important:** Root directory MUST be empty. Setting it to `/` causes "root directory not found" error because the build expects to run pnpm workspace commands from project root.

**Why `SKIP_DEPENDENCY_INSTALL=1`?** The CF Pages Workers Builds image runs `bun install` before the user build command to warm a dependency cache. When `pnpm install` then runs, it detects the bun-installed packages, moves them to `node_modules/.ignored`, and re-installs. During this transition the `@mp-calculator/shared` workspace link breaks and pnpm tries to fetch it from the npm registry → 404. Setting `SKIP_DEPENDENCY_INSTALL=1` skips the bun phase entirely so pnpm installs cleanly from scratch.

**Alternative (no env var):** add `--filter @mp-calculator/web --filter @mp-calculator/shared` to the `pnpm install` command so it skips `apps/api` and never trips the broken workspace lookup:
```bash
pnpm install --no-frozen-lockfile --filter @mp-calculator/web --filter @mp-calculator/shared && pnpm --filter @mp-calculator/web run build
```

**SPA routing:** Handled by `apps/web/public/_redirects` (all routes → `/index.html`).

**Caching:** `apps/web/public/_headers` sets immutable cache for hashed assets, fresh `/index.html` per request.

### Environment Variables

#### API Required
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=min-32-char-secret
COOKIE_SECRET=min-32-char-secret
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

#### API Optional
```env
DEEPL_API_KEY=your-deepl-key
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

#### Web Required
```env
VITE_API_URL=https://api.yourdomain.com
```

## Development

### Code Quality
```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm prettier --write .
```

### Database Operations
```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes (dev)
pnpm db:push

# Create migration
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed
```

### Adding New Marketplace
1. Add fee config to `packages/shared/src/fee-engine.ts`
2. Update `MarketplaceFeeConfig` type in `packages/shared/src/types.ts`
3. Add marketplace to validation schemas
4. Run database migration for new config
5. Update frontend marketplace list

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/jokoprianto612-lang/mp-calculator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jokoprianto612-lang/mp-calculator/discussions)
- **Email**: support@mpcalculator.app

## Acknowledgments

- **DeepL** for translation API
- **Indonesian Marketplace Communities** for fee structure data
- **Open Source Contributors** for all the amazing libraries used/usr/bin/bash: line 7: /c/Users/asusv/AppData/Local/hermes/cache/terminal/hermes-cwd-2819669c4129.txt: Device or resource busy
