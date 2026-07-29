# EcoLabel X

**Intelligent Sustainability Intelligence Platform**

> Real-time eco-label verification, carbon transparency, and sustainability scoring for every product in your supply chain.

---

## 🚀 Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Framework   | Next.js 15 (App Router)               |
| Language    | TypeScript (strict mode)              |
| Styling     | Tailwind CSS v4 + Custom Design System |
| Fonts       | Inter (body) + Space Grotesk (display)|
| UI Pattern  | Glassmorphism + Dark Futuristic       |

---

## 📁 Project Structure

```
ecolabel-x/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (fonts, metadata)
│   │   ├── page.tsx                 # Home page shell
│   │   ├── globals.css              # Design system CSS
│   │   ├── not-found.tsx            # 404 page
│   │   ├── global-error.tsx         # Global error boundary
│   │   ├── auth/
│   │   │   ├── layout.tsx           # Centered auth layout
│   │   │   ├── login/page.tsx       # Login page shell
│   │   │   └── register/page.tsx    # Register page shell
│   │   └── dashboard/
│   │       ├── layout.tsx           # Dashboard layout with Sidebar
│   │       └── page.tsx             # Overview page shell
│   │
│   ├── components/
│   │   ├── index.ts                 # Master barrel export
│   │   ├── ui/                      # Primitive UI components
│   │   │   ├── Button.tsx           # 5 variants, 5 sizes, loading state
│   │   │   ├── Badge.tsx            # 6 color variants
│   │   │   ├── Card.tsx             # Glassmorphism card + subcomponents
│   │   │   ├── Input.tsx            # Form input with validation states
│   │   │   ├── EcoScoreRing.tsx     # SVG circular progress (tier-aware)
│   │   │   ├── Skeleton.tsx         # Loading placeholder
│   │   │   └── index.ts
│   │   ├── layout/                  # Page layout components
│   │   │   ├── Navbar.tsx           # Scroll-aware glassmorphism nav
│   │   │   ├── Footer.tsx           # Multi-column footer
│   │   │   ├── Sidebar.tsx          # Collapsible dashboard sidebar
│   │   │   └── index.ts
│   │   └── dashboard/               # Dashboard-specific components
│   │       ├── StatCard.tsx         # Metric card with trends
│   │       └── index.ts
│   │
│   ├── lib/
│   │   ├── index.ts                 # Lib barrel export
│   │   ├── utils/
│   │   │   ├── cn.ts                # clsx + tailwind-merge
│   │   │   ├── formatters.ts        # Carbon, date, score formatters
│   │   │   ├── validators.ts        # Type-safe validators
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   └── index.ts             # Routes, colors, thresholds, nav
│   │   └── hooks/
│   │       ├── useMediaQuery.ts     # Breakpoint tracking
│   │       ├── useLocalStorage.ts   # Persistent state with tab sync
│   │       ├── useDebounce.ts       # Debounced value
│   │       └── index.ts
│   │
│   └── types/
│       └── index.ts                 # All TypeScript interfaces & types
│
├── public/                          # Static assets
├── next.config.ts                   # Next.js config (headers, images)
├── tsconfig.json                    # TypeScript config
├── eslint.config.mjs                # ESLint config
└── package.json
```

---

## 🎨 Design System

### Color Palette
| Token                | Value                | Usage                   |
|----------------------|----------------------|-------------------------|
| `--color-cosmos`     | `#050a18`            | Background              |
| `--color-neon-green` | `#00ffaa`            | Primary accent          |
| `--color-neon-blue`  | `#00c8ff`            | Secondary accent        |
| `--color-neon-purple`| `#9b59ff`            | Tertiary accent         |
| `--color-neon-amber` | `#ffb300`            | Warning / gold tier     |

### Utility Classes
- **`.glass`** — Glassmorphism container
- **`.glass-hover`** — Glass with hover lift
- **`.text-gradient-eco`** — Green→Blue gradient text
- **`.text-gradient-brand`** — Purple→Blue gradient text
- **`.bg-grid`** — Subtle neon grid pattern
- **`.bg-dots`** — Dot matrix pattern
- **`.glow-green`** / **`.glow-blue`** — Box glow shadows

### Eco Score Tiers
| Tier     | Min Score | Color      |
|----------|-----------|------------|
| Platinum | 90        | `#00ffaa`  |
| Gold     | 75        | `#ffb300`  |
| Silver   | 55        | `#94a3b8`  |
| Bronze   | 30        | `#c97d4e`  |

---

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Next Steps (Page Implementation)

- [ ] Landing / Hero page
- [ ] Features section
- [ ] Pricing page
- [ ] Dashboard overview with live stats
- [ ] Products list & detail
- [ ] Eco Labels management
- [ ] Carbon reports & charts
- [ ] Analytics dashboard
- [ ] Auth flows (login / register)
- [ ] Settings page
