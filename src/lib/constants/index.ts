/**
 * EcoLabel X — Application Constants
 */

// ─── App Meta ────────────────────────────────────────────────────────────────
export const APP_NAME    = "EcoLabel X" as const;
export const APP_VERSION = "1.0.0" as const;
export const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? "https://ecolabelx.com";

// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL    = process.env.NEXT_PUBLIC_API_URL ?? "/api";
export const API_TIMEOUT_MS  = 15_000;
export const DEFAULT_PAGE_SIZE = 20;

// ─── Eco Score Thresholds ─────────────────────────────────────────────────────
export const ECO_SCORE_THRESHOLDS = {
  platinum: 90,
  gold:     75,
  silver:   55,
  bronze:   30,
} as const;

// ─── Eco Score Colors ─────────────────────────────────────────────────────────
export const ECO_SCORE_COLORS = {
  platinum: "#00ffaa",
  gold:     "#ffb300",
  silver:   "#94a3b8",
  bronze:   "#c97d4e",
} as const;

// ─── Label Status Colors ──────────────────────────────────────────────────────
export const LABEL_STATUS_COLORS = {
  verified: "#00ffaa",
  pending:  "#ffb300",
  expired:  "#64748b",
  rejected: "#ef4444",
} as const;

// ─── Carbon Categories ────────────────────────────────────────────────────────
export const CARBON_CATEGORIES = [
  "Raw Materials",
  "Manufacturing",
  "Packaging",
  "Transportation",
  "Retail",
  "Consumer Use",
  "End of Life",
] as const;

export type CarbonCategory = (typeof CARBON_CATEGORIES)[number];

// ─── Product Categories ───────────────────────────────────────────────────────
export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  food:        "Food & Nutrition",
  beverage:    "Beverages",
  beauty:      "Beauty & Personal Care",
  household:   "Household Products",
  electronics: "Electronics",
  apparel:     "Apparel & Textiles",
  packaging:   "Packaging",
};

// ─── Regions ──────────────────────────────────────────────────────────────────
export const REGIONS = [
  "Global",
  "European Union",
  "United States",
  "United Kingdom",
  "Asia Pacific",
  "Latin America",
  "Africa",
  "Middle East",
] as const;

// ─── Subscription Tiers ───────────────────────────────────────────────────────
export const SUBSCRIPTION_TIERS = {
  free:       { label: "Free",       maxProducts: 5,   color: "#64748b" },
  starter:    { label: "Starter",    maxProducts: 50,  color: "#00c8ff" },
  pro:        { label: "Pro",        maxProducts: 500, color: "#9b59ff" },
  enterprise: { label: "Enterprise", maxProducts: Infinity, color: "#00ffaa" },
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  home:       "/",
  dashboard:  "/dashboard",
  products:   "/dashboard/products",
  labels:     "/dashboard/labels",
  carbon:     "/dashboard/carbon",
  analytics:  "/dashboard/analytics",
  upload:     "/dashboard/upload",
  agents:     "/dashboard/agents",
  claims:     "/dashboard/claims",
  verify:        "/dashboard/verify",
  greenwashing:   "/dashboard/greenwashing",
  results:        "/dashboard/results",
  audit:          "/dashboard/audit",
  settings:   "/dashboard/settings",
  profile:    "/profile",
  login:      "/auth/login",
  register:   "/auth/register",
} as const;

// ─── Navigation ───────────────────────────────────────────────────────────────
export const MAIN_NAV = [
  { label: "Platform",   href: "#platform" },
  { label: "Solutions",  href: "#solutions" },
  { label: "Pricing",    href: "#pricing" },
  { label: "About",      href: "#about" },
] as const;

export const DASHBOARD_NAV = [
  { label: "Overview",    href: ROUTES.dashboard, icon: "grid"      },
  { label: "Products",    href: ROUTES.products,  icon: "package"   },
  { label: "Eco Labels",  href: ROUTES.labels,    icon: "shield"    },
  { label: "Carbon",      href: ROUTES.carbon,    icon: "leaf"      },
  { label: "Analytics",   href: ROUTES.analytics, icon: "bar-chart" },
  { label: "AI Agents",         href: ROUTES.agents,       icon: "cpu"           },
  { label: "Claim Detector",    href: ROUTES.claims,       icon: "search"        },
  { label: "Evidence Verifier", href: ROUTES.verify,       icon: "shield-check"  },
  { label: "Greenwashing",      href: ROUTES.greenwashing, icon: "alert-triangle" },
  { label: "Results",           href: ROUTES.results,      icon: "bar-chart-2"   },
  { label: "Audit Report",      href: ROUTES.audit,        icon: "file-text"     },
  { label: "Upload",            href: ROUTES.upload,       icon: "upload"        },
  { label: "Settings",    href: ROUTES.settings,  icon: "settings"  },
] as const;
