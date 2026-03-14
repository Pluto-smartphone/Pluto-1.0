import type { ProductListItem } from "@/lib/types";

const featured: ProductListItem[] = [
  {
    id: "demo-iphone-14-pro-256",
    brand: "iphone",
    model: "iPhone 14 Pro",
    storage_gb: 256,
    color: "Space Black",
    condition_grade: "excellent",
    battery_health_percent: 91,
    warranty_months: 12,
    price_thb: 29900,
    average_rating: 4.7,
    review_count: 182,
    featured: true,
  },
  {
    id: "demo-iphone-13-128",
    brand: "iphone",
    model: "iPhone 13",
    storage_gb: 128,
    color: "Starlight",
    condition_grade: "good",
    battery_health_percent: 88,
    warranty_months: 6,
    price_thb: 18900,
    average_rating: 4.5,
    review_count: 96,
  },
  {
    id: "demo-s24-256",
    brand: "samsung",
    model: "Galaxy S24",
    storage_gb: 256,
    color: "Onyx Black",
    condition_grade: "like_new",
    battery_health_percent: 97,
    warranty_months: 12,
    price_thb: 25900,
    average_rating: 4.8,
    review_count: 74,
    featured: true,
  },
  {
    id: "demo-a54-128",
    brand: "samsung",
    model: "Galaxy A54",
    storage_gb: 128,
    color: "Awesome Violet",
    condition_grade: "fair",
    battery_health_percent: 84,
    warranty_months: 3,
    price_thb: 8900,
    average_rating: 4.2,
    review_count: 41,
  },
];

export function getFeaturedProducts() {
  return featured;
}

