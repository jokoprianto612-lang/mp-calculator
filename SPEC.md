# MP Calculator - Product Specification

## Overview
A marketplace profit calculator for e-commerce sellers (Tokopedia, Shopee, Lazada, TikTok Shop) with integrated translation capabilities. Calculates recommended selling prices, profit margins, and detailed fee breakdowns.

## Core Features

### 1. Marketplace Calculator
**Two calculation modes:**
- **Marketplace Price (Harga Jual Marketplace)** - Standard store price
- **Live Selling Price (Harga Jual Live)** - Live streaming discounted price

**Inputs:**
- Cost of Goods (HPP / Harga Modal)
- Target Profit Margin %
- Marketplace selection (affects fee structure)
- Voucher/Discount amounts
- Advertising budget
- Shipping settings (free shipping programs)
- Packing costs

**Outputs:**
- Recommended selling price
- Net profit amount and percentage
- Detailed fee breakdown (accordion)
- Marketplace deduction vs seller cost percentages

### 2. Fee Structure (Indonesian Marketplaces)

**Standard Fees:**
- Platform Commission (Komisi Platform) - typically 2-5%
- Dynamic Commission (Komisi Dinamis) - category-based
- Mall Service Fee (Biaya Layanan Mall) - for mall sellers
- Order Processing Fee (Biaya Pemrosesan Pesanan) - fixed per order
- Logistics Service Fee (Biaya Layanan Logistik) - weight/distance based
- AMS Commission (Komisi AMS) - advertising platform
- Advertising Fee (Biaya Iklan) - user defined
- Free Shipping Promos (Gratis Ongkir XTRA, Promo Xtra)
- Income Tax PPh 22 (0.5% of Net Sale)
- Packing Cost (Biaya Packing) - user defined

### 3. Translation Feature
- DeepL API integration
- Support for ID ↔ EN (primary), plus other languages
- Real-time translation of UI labels and calculation results
- Persistent language preference per user

### 4. User Features
- Authentication (Email/Password + OAuth Google/GitHub)
- Save calculation history
- Saved presets/templates
- Export to PDF/CSV
- Dark/Light theme

## Technical Architecture

### Monorepo Structure
```
mp-calculator/
├── apps/
│   ├── api/              # Fastify backend
│   ├── web/              # React frontend
│   └── worker/           # Background jobs (PDF generation, etc.)
├── packages/
│   ├── shared/           # Shared types, utilities, fee engine
│   ├── ui/               # Shared UI components
│   └── config/           # Shared config (Tailwind, ESLint, TS)
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── Dockerfile.worker
├── k8s/
│   ├── base/
│   ├── overlays/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── helm/
├── .github/
│   └── workflows/
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### Technology Stack

**Backend:**
- Fastify + TypeScript
- Prisma ORM + PostgreSQL
- Redis (caching, sessions, rate limiting)
- JWT + OAuth 2.0 (Google, GitHub)
- Zod validation
- OpenAPI/Swagger docs

**Frontend:**
- React 18 + TypeScript + Vite
- TanStack Router (type-safe routing)
- TanStack Query (server state)
- React Hook Form + Zod
- Tailwind CSS + Headless UI
- Framer Motion (animations)
- i18next (internationalization)

**Infrastructure:**
- Docker + Docker Compose (local)
- Kubernetes (EKS/GKE/AKS) + Helm
- GitHub Actions CI/CD
- Cloudflare (CDN, WAF, DNS)
- PostgreSQL (managed: RDS/Cloud SQL)
- Redis (managed: ElastiCache/Memorystore)

## API Design

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/oauth/{provider}
```

### Calculations
```
POST   /api/v1/calculations           # Create calculation
GET    /api/v1/calculations           # List user's calculations
GET    /api/v1/calculations/:id       # Get calculation detail
PATCH  /api/v1/calculations/:id       # Update calculation
DELETE /api/v1/calculations/:id       # Delete calculation
POST   /api/v1/calculations/:id/duplicate
GET    /api/v1/calculations/presets   # Get saved presets
POST   /api/v1/calculations/presets   # Save preset
```

### Translation
```
POST   /api/v1/translate              # Translate text
GET    /api/v1/translate/languages    # Supported languages
```

### Marketplace Config
```
GET    /api/v1/marketplaces           # List supported marketplaces
GET    /api/v1/marketplaces/:id/fees  # Get fee structure
```

## Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String?
  avatar        String?
  provider      String?   // "email", "google", "github"
  providerId    String?
  locale        String    @default("id")
  theme         String    @default("system")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  calculations  Calculation[]
  presets       Preset[]
  sessions      Session[]
  @@index([email])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([token])
}

model Calculation {
  id              String   @id @default(cuid())
  userId          String
  name            String?
  marketplace     String   // "tokopedia", "shopee", "lazada", "tiktok"
  mode            String   // "marketplace", "live"
  inputs          Json     // All input parameters
  results         Json     // Calculated results
  breakdown       Json     // Detailed fee breakdown
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([createdAt])
}

model Preset {
  id          String   @id @default(cuid())
  userId      String
  name        String
  marketplace String
  inputs      Json
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model MarketplaceFeeConfig {
  id              String   @id @default(cuid())
  marketplace     String   @unique
  version         Int      @default(1)
  config          Json     // Fee structure configuration
  effectiveFrom   DateTime @default(now())
  effectiveUntil  DateTime?
  createdAt       DateTime @default(now())
}
```

## Fee Calculation Engine

### Core Algorithm
```
Net Sale = Selling Price - Seller Voucher
Platform Fee = Net Sale × Platform Commission Rate
Dynamic Fee = Net Sale × Dynamic Commission Rate (by category)
Mall Fee = Net Sale × Mall Service Rate (if mall seller)
Order Processing Fee = Fixed per order
Logistics Fee = Calculate by weight, dimensions, destination
AMS Fee = Net Sale × AMS Rate (if using ads)
Ad Fee = User defined advertising budget
Free Shipping Fee = Calculate based on program
Promo Fee = Calculate based on promo program
Tax (PPh 22) = Net Sale × 0.5%
Packing Cost = User defined

Total Deductions = Sum of all fees
Seller Costs = HPP + Packing + Ad Fee + Other seller-borne costs
Net Profit = Net Sale - Total Deductions - HPP - Packing - Ad Fee
Profit Margin = (Net Profit / Net Sale) × 100

Marketplace Deduction % = (Platform Fees + Dynamic + Mall + Processing + Logistics + AMS) / Net Sale × 100
Seller Cost % = (HPP + Packing + Ad Fee + Promo + Tax) / Net Sale × 100
```

### Marketplace-Specific Configs
Each marketplace has different fee structures stored in `MarketplaceFeeConfig`.

## UI/UX Specification

### Design System
- **Colors:** 
  - Primary: Orange #FF6B35 (matching screenshots)
  - Secondary: Dark slate #0F172A
  - Success: Green #10B981
  - Danger: Red #EF4444
  - Backgrounds: White, Slate 50, Slate 900
- **Typography:** Inter / system fonts
- **Spacing:** 4px base unit
- **Border Radius:** 8px (cards), 12px (modals), 4px (inputs)
- **Shadows:** Subtle, layered
- **Animations:** 150-200ms spring transitions

### Responsive Breakpoints
- Mobile: < 640px (single column, bottom sheet modals)
- Tablet: 640px - 1024px (two column grid)
- Desktop: > 1024px (three column, sidebar navigation)

### Key Screens
1. **Landing/Calculator** - Main calculation interface
2. **History** - List of past calculations
3. **Presets** - Saved templates
4. **Settings** - Theme, language, account
5. **Auth** - Login/Register/OAuth

### Calculator Layout (Mobile)
```
┌─────────────────────────┐
│ MP Calculator  ☰        │
├─────────────────────────┤
│ ████████████████████████ │  ← Orange card: Marketplace Price
│ Harga Jual Marketplace  │
│ ┌───────────────────┐   │
│ │ Rp250.000      ✏️ │   │
│ └───────────────────┘   │
│ Untung bersih +Rp13.096 │
├─────────────────────────┤
│ Harga Jual Live         │  ← White card: Live Price
│ ┌───────────────────┐   │
│ │ Rp191.000      ✏️ │   │
│ └───────────────────┘   │
│ Untung +Rp386 (0.2%)    │
├─────────────────────────┤
│ ┌─────────┬─────────┐   │  ← Two column grid
│ │Marketpl.│  Seller │   │
│ │  25.8%  │  69.0%  │   │
│ └─────────┴─────────┘   │
├─────────────────────────┤
│ ▼ Sembunyikan rincian   │  ← Accordion toggle
├─────────────────────────┤
│ Harga Jual Marketplace  │ Rp250.000
│ Voucher                 │ -Rp0
│ Net Sale                │ Rp250.000
│ Harga Modal (HPP)       │ -Rp150.000
│ Biaya Komisi Dinamis    │ -Rp17.500
│ Biaya Komisi Platform   │ -Rp21.650
│ ...                     │ ...
│ Untung Bersih           │ +Rp13.096
├─────────────────────────┤
│ Lihat rincian Harga     │  ← Footer button
│ Jual Live               │
└─────────────────────────┘
```

## Translation Integration

### DeepL API
- Endpoint: `https://api-free.deepl.com/v2/translate` (free tier) or `https://api.deepl.com/v2/translate` (pro)
- Auth: `Authorization: DeepL-Auth-Key {key}`
- Request: `{ text: ["..."], target_lang: "EN", source_lang: "ID" }`
- Response: `{ translations: [{ text: "...", detected_source_language: "ID" }] }`

### Implementation
- Backend proxy to hide API key
- Frontend: react-i18next with dynamic namespace loading
- Cache translations in Redis (24h TTL)
- Fallback to browser translation API if DeepL unavailable

## Security

- HTTPS everywhere (Cloudflare TLS)
- JWT in HttpOnly Secure cookies
- CSRF protection (SameSite=Strict + double-submit)
- Rate limiting (100 req/min per IP, 1000 req/min per user)
- Input validation (Zod schemas)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (Content-Security-Policy headers)
- Secrets in environment variables / Kubernetes secrets

## Deployment

### Environments
- **Development** - Local Docker Compose
- **Staging** - Kubernetes namespace, auto-deploy from `develop` branch
- **Production** - Kubernetes, manual promotion from staging

### Sandbox/Review Environment
- Ephemeral preview deployments for PRs
- Unique subdomain: `pr-{number}.sandbox.mpcalculator.app`
- Seeded with test data
- Auto-destroy after 7 days or PR merge

### CI/CD Pipeline
1. **Lint & Typecheck** - ESLint, TypeScript, Prettier
2. **Unit Tests** - Vitest (frontend), Jest (backend)
3. **Integration Tests** - Testcontainers for DB/Redis
4. **Build** - Docker multi-stage builds
5. **Security Scan** - Trivy, npm audit
6. **Deploy Staging** - On merge to `develop`
7. **E2E Tests** - Playwright against staging
8. **Deploy Production** - Manual approval, tag release

## Future Extensibility

- Plugin system for new marketplaces
- Webhook notifications for price changes
- API for third-party integrations
- Multi-currency support
- Bulk calculation import/export
- Team/workspace collaboration
- Affiliate/referral program