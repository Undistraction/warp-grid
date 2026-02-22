# CLAUDE.md

## Project Overview

**warp-grid** is a TypeScript library that creates complex 2D grids warped using Coons patches (surface interpolation bounded by four cubic Bezier curves). It provides geometric data about grid lines, intersections, and cell bounds — rendering is left to the consumer (SVG, Canvas, etc.).

Published to npm as `warp-grid` (v4.2.0, MIT license). Repository: `undistraction/warp-grid`.

## Tech Stack

- **Language:** TypeScript 5.8 (strict mode)
- **Runtime:** Node.js 22.13.1 (see `.nvmrc`)
- **Package manager:** pnpm 9.15.4
- **Build:** Vite 6 (library mode, outputs ES + CJS to `dist/`)
- **Testing:** Vitest 3 with jest-extended matchers
- **Linting:** ESLint 9 (flat config) + Prettier 3
- **Docs:** TypeDoc (generated to `docs/`)
- **Release:** semantic-release with conventional commits

## Key Commands

```bash
pnpm run test              # Run tests once (vitest run)
pnpm run test-watch        # Watch mode
pnpm run test-coverage     # Coverage report (v8 provider)
pnpm run test-snapshot     # Update snapshots (-u)
pnpm run lint              # Prettier + ESLint (auto-fix)
pnpm run build             # Vite build + TypeDoc
pnpm run tsc               # Type-check only (noEmit)
pnpm run docs              # Generate TypeDoc
```

## Project Structure

```
src/
├── index.ts                  # Public API entry point (re-exports)
├── api.ts                    # Main warpGrid() factory function
├── getGridApi.ts             # Grid API implementation (memoized methods)
├── types.ts                  # All type definitions
├── enums.ts                  # InterpolationStrategy, LineStrategy, CellBoundsOrder
├── validation.ts             # Input validation (throws ValidationError)
├── errors/
│   └── ValidationError.ts    # Custom error class
├── interpolate/
│   ├── pointOnCurve/         # Point interpolation strategies (linear, evenly-spaced)
│   └── curves/               # Line strategies (straight, curved)
├── utils/
│   ├── bezier.ts             # Bezier curve calculations
│   ├── easing.ts             # Bezier easing wrapper
│   ├── functional.ts         # Functional helpers (map, times)
│   ├── is.ts                 # Type guards (isArray, isFunction, etc.)
│   ├── math.ts               # Math utilities
│   ├── matrix.ts             # Matrix operations
│   └── steps.ts              # Step/gutter processing

tests/
├── warpGrid.unit.test.ts     # Main integration tests
├── utils/                    # Utility function unit tests
├── validations/              # Validation tests
├── fixtures.ts               # Test fixtures
├── helpers.ts                # Test helpers
├── setup.ts                  # Vitest setup (jest-extended)
└── __snapshots__/            # Snapshot files
```

## Code Conventions

### Formatting (Prettier)

- **No semicolons**
- **Single quotes** (but ESLint enforces **backtick quotes** — template literals preferred everywhere)
- **2-space indentation**, 80-char print width
- **Trailing commas:** ES5 style
- **Single attribute per line**

### TypeScript

- Strict mode enabled
- Types defined in `src/types.ts`, re-exported from `src/index.ts`
- Use `type` imports for type-only imports
- Heavy use of factory and strategy patterns
- Memoization via `fast-memoize` for expensive calculations

### ESLint

- Flat config in `eslint.config.mjs`
- `simple-import-sort` plugin enforces import ordering
- `unused-imports` plugin auto-removes unused imports
- Unused variables must be prefixed with `_`

### Testing

- **Use `it()` not `test()`** (enforced by vitest ESLint plugin)
- Test files must match `*.unit.test.{ts,js}` pattern
- Prefer comparison/equality matchers
- Hooks must be on top and in order (beforeAll → beforeEach → afterEach → afterAll)
- Vitest globals enabled (no imports needed for `describe`, `it`, `expect`)

### Git Hooks (Husky)

- **pre-commit:** lint-staged (prettier + eslint) → tests → tsc
- **commit-msg:** commitlint (conventional commits)

### Commit Message Format

Conventional commits required. Allowed types:
`build`, `ci`, `chore`, `content`, `debug`, `deps`, `docs`, `feat`, `fix`, `hotfix`, `merge`, `perf`, `refactor`, `revert`, `style`, `test`

Subject must be **sentence-case**. Example: `feat: Add support for nested grids`

## Architecture Notes

### Core Flow

1. `warpGrid(boundingCurves, gridDefinition)` → validates inputs → merges defaults → processes steps → creates API
2. The API object exposes memoized methods: `getPoint()`, `getIntersections()`, `getLines()`, `getCellBounds()`, `getAllCellBounds()`
3. All expensive computations are lazy (computed on first call, then cached via `fast-memoize`)

### Key Dependencies

- **coons-patch** (4.0.0): Core surface interpolation — provides `BoundingCurves`, `Curve`, `Point` types
- **bezier-js**: Bezier curve math
- **bezier-easing**: Easing functions for point distribution along curves
- **ml-matrix**: Matrix operations for interpolation
- **fast-memoize**: Performance caching

### Strategies

- **InterpolationStrategy**: `even` (default, uniform spacing) or `linear` (faster, follows curve curvature). Custom factory functions also accepted.
- **LineStrategy**: `straightLines` (default) or `curves` (accurate but slower)

## CI/CD

GitHub Actions pipeline (`.github/workflows/release.yml`):
security audit → lint → test → build + semantic-release

Releases are automated via semantic-release on push to `main`. The `next` branch supports prereleases.
