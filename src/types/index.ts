/**
 * EcoLabel X — Core Type Definitions
 */

// ─── Eco Label ────────────────────────────────────────────────────────────────

export type EcoLabelStatus = "verified" | "pending" | "expired" | "rejected";
export type EcoLabelTier   = "platinum" | "gold" | "silver" | "bronze";

export interface EcoLabel {
  id:           string;
  name:         string;
  issuer:       string;
  logoUrl:      string;
  status:       EcoLabelStatus;
  tier:         EcoLabelTier;
  issuedAt:     string; // ISO date
  expiresAt:    string; // ISO date
  certNumber:   string;
  region:       string[];
  categories:   string[];
  description?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductCategory =
  | "food"
  | "beverage"
  | "beauty"
  | "household"
  | "electronics"
  | "apparel"
  | "packaging";

export interface Product {
  id:             string;
  name:           string;
  brand:          string;
  sku:            string;
  category:       ProductCategory;
  imageUrl:       string;
  description:    string;
  ecoScore:       number;       // 0–100
  carbonKg:       number;       // kg CO₂e
  labels:         EcoLabel[];
  ingredients?:   string[];
  materials?:     string[];
  origin?:        string;
  updatedAt:      string;
}

// ─── Carbon ───────────────────────────────────────────────────────────────────

export type EmissionScope = "scope1" | "scope2" | "scope3";

export interface CarbonDataPoint {
  date:     string;
  value:    number;
  unit:     "kgCO2e" | "tCO2e";
  scope:    EmissionScope;
  category: string;
}

export interface CarbonReport {
  id:           string;
  productId:    string;
  period:       string;
  totalKg:      number;
  breakdown:    CarbonDataPoint[];
  methodology:  string;
  verifiedBy?:  string;
  createdAt:    string;
}

// ─── Brand / Organization ─────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

export interface Brand {
  id:                string;
  name:              string;
  logoUrl:           string;
  website:           string;
  country:           string;
  subscriptionTier:  SubscriptionTier;
  productCount:      number;
  avgEcoScore:       number;
  createdAt:         string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "brand_manager" | "auditor" | "viewer";

export interface User {
  id:         string;
  name:       string;
  email:      string;
  avatarUrl?: string;
  role:       UserRole;
  brandId?:   string;
  createdAt:  string;
}

// ─── UI / Navigation ─────────────────────────────────────────────────────────

export interface NavItem {
  label:    string;
  href:     string;
  icon?:    string;
  badge?:   string | number;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data:       T;
  success:    boolean;
  message?:   string;
  pagination?: Pagination;
}

export interface Pagination {
  page:       number;
  pageSize:   number;
  total:      number;
  totalPages: number;
}

export interface ApiError {
  code:     string;
  message:  string;
  details?: Record<string, string[]>;
}

// ─── Filters & Search ─────────────────────────────────────────────────────────

export interface ProductFilters {
  category?:   ProductCategory;
  minScore?:   number;
  maxScore?:   number;
  labelTier?:  EcoLabelTier;
  region?:     string;
  search?:     string;
}

// ─── Analytics / Dashboard ────────────────────────────────────────────────────

export interface StatCard {
  label:       string;
  value:       string | number;
  unit?:       string;
  delta?:      number;       // percentage change
  deltaLabel?: string;
  icon?:       string;
  color?:      "green" | "blue" | "purple" | "amber";
}

export interface ChartDataPoint {
  label:  string;
  value:  number;
  color?: string;
}
