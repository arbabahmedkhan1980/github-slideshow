# UniQube Pod Estimator

Production-grade internal tool for estimating modular bathroom pods from architectural drawings. The stack is **Next.js (App Router) + TailwindCSS + Prisma + PostgreSQL** with PDF parsing, bathroom detection, cost modelling, and proposal generation.

## Features

- Upload floor-by-floor PDF plans, auto-store files, and run a pluggable bathroom detector (PDF text bounding boxes for now).
- Manually capture bathrooms (length/width/height) when PDFs are noisy.
- Group bathrooms into types within a configurable tolerance and keep traceability back to source drawings.
- Configure spec tiers (structure, finishes, second fix) and compute pod costs via a rate-driven engine (area rates + SKU price lists).
- Generate client-ready proposal PDFs summarising bathroom mix, spec tiers, and commercial totals.
- REST API documented via `/api/docs` (OpenAPI JSON).

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or remote)

Create a `.env` file using the template:

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` (e.g. `postgresql://postgres:postgres@localhost:5432/uniq`).

### Install dependencies

```bash
npm install
```

### Database

Generate the Prisma client and push the schema:

```bash
npm run db:generate
npm run db:push
```

Seed rate profiles if needed via API (`POST /api/rate-profiles`).

### Development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Testing & linting

```bash
npm run test       # vitest (server logic)
npm run lint       # Next.js + ESLint
```

## Project Structure

```
src/
  app/                # Next.js App Router routes (pages + APIs)
  components/         # Shared UI components
  features/           # Feature-oriented client components
  lib/                # Utilities (geometry, types, formatting)
  server/             # Domain services (cost engine, grouping, PDF parsing)
  db/                 # Prisma client singleton
prisma/schema.prisma  # Database schema
uploads/              # Stored PDF plans (gitignored)
```

## Key Flows

1. **Projects dashboard** – create projects, review floors, and navigate to per-project workspace.
2. **Floor uploads** – upload PDF plans per floor, optionally run auto-detection (text + dims).
3. **Bathroom grouping** – cluster bathrooms into `BathroomType` entities; allow manual override by editing spec/instances.
4. **Spec configuration** – assign rate profile + tiers, define selections (lights, WC, etc.).
5. **Cost engine** – run `POST /api/bathroom-types/:id/cost` to persist a snapshot.
6. **Proposal PDF** – `POST /api/projects/:id/proposal` returns a downloadable PDF summarising the whole project.

## API Overview

See `GET /api/docs` for the OpenAPI document. Core endpoints:

- `GET/POST /api/projects`
- `GET/PUT /api/projects/:id`
- `GET/POST /api/projects/:id/floors`
- `POST /api/floors/:id/uploads`
- `GET/POST /api/projects/:id/bathrooms`
- `POST /api/projects/:id/bathroom-types/group`
- `GET/PUT /api/bathroom-types/:id/spec`
- `POST /api/bathroom-types/:id/cost`
- `POST /api/projects/:id/proposal`
- `GET/POST /api/rate-profiles`

## PDF Parsing Pipeline

`BathroomDetector` ( `src/server/pdf/bathroom-detector.ts` ):

1. Extract text with bounding boxes using `pdfjs-dist`.
2. Find keywords (`BATH`, `WC`, `POWDER`, etc.).
3. Pair nearby numeric strings as length/width (mm). Default height comes from project/floor.
4. Persist `BathroomInstance` entries with traceability: floor, page, source file, bounding box.

The detector is isolated so we can later swap PDF parsing for Revit/IFC/DWG ingestion.

## Cost Engine

Located at `src/server/cost/cost-engine.ts`.

- Computes geometry (floor/wall/ceiling areas) from bathroom type dimensions.
- Pulls rates + SKUs from the assigned `RateProfile`.
- Applies tiers for structure, finishes, glass, sanitaryware, and lighting.
- Returns a structured breakdown + summary; persists snapshots for reporting.

## Proposal Generation

`POST /api/projects/:id/proposal` renders a PDF via `pdfkit` containing:

- Cover with project/client/timestamp.
- Table of bathroom types with counts and cost per pod.
- Commercial summary / assumptions.

## Roadmap

- Extend spec editor (per-wall overrides, vanity configurators).
- Sync costs with BIM/Revit metadata.
- Add authentication & role-based access.
- Integrate cloud storage for uploads.
- Automate baseline rate-profile seeding per region.
