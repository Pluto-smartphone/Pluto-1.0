export type Brand = "iphone" | "samsung";
export type ConditionGrade = "like_new" | "excellent" | "good" | "fair";

export type ProductListItem = {
  id: string;
  brand: Brand;
  model: string;
  storage_gb: number;
  color?: string | null;
  condition_grade: ConditionGrade;
  battery_health_percent: number;
  warranty_months: number;
  price_thb: number;
  average_rating?: number | null;
  review_count: number;
  featured?: boolean;
  primary_image_url?: string | null;
};

