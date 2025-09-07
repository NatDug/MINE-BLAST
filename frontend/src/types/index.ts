// API Types
export interface User {
  id: number;
  email: string;
  full_name?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Blast {
  id: number;
  name: string;
  description?: string;
  bench?: string;
  holes: Hole[];
}

export interface Hole {
  id: number;
  hole_id: string;
  burden?: number;
  spacing?: number;
  diameter_mm?: number;
  hole_depth_m?: number;
  stemming_m?: number;
  explosive_density_kg_m3?: number;
  explosive_column_m?: number;
}

export interface BlastSummary {
  burden: { min: number; max: number; avg: number };
  spacing: { min: number; max: number; avg: number };
  holes: number;
}

export interface PowderFactorResult {
  avg_powder_factor: number;
}

export interface MapLayer {
  id: number;
  name: string;
  layer_type: string;
  geojson: any;
}

export interface DrillPlan {
  id: number;
  name: string;
  description?: string;
  bench?: string;
  burden: number;
  spacing: number;
  rows: number;
  cols: number;
  origin_x: number;
  origin_y: number;
  grid_geojson?: any;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface SignupForm {
  email: string;
  full_name?: string;
  password: string;
}

export interface BlastForm {
  name: string;
  description?: string;
  bench?: string;
  holes?: HoleForm[];
}

export interface HoleForm {
  hole_id: string;
  burden?: number;
  spacing?: number;
  diameter_mm?: number;
  hole_depth_m?: number;
  stemming_m?: number;
  explosive_density_kg_m3?: number;
  explosive_column_m?: number;
}

export interface DrillPlanForm {
  name: string;
  description?: string;
  bench?: string;
  burden: number;
  spacing: number;
  rows: number;
  cols: number;
  origin_x: number;
  origin_y: number;
}
