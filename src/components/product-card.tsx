import Image from "next/image";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/lib/types";

function gradeLabel(g: ProductListItem["condition_grade"]) {
  switch (g) {
    case "like_new":
      return "Like New";
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "fair":
      return "Fair";
  }
}

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <article className="hover-lift group overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          src={product.primary_image_url ?? "/placeholder-phone.svg"}
          alt={`${product.brand} ${product.model}`}
          fill
          className="object-cover transition-transform group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground">{gradeLabel(product.condition_grade)}</Badge>
          {product.featured ? <Badge variant="secondary">Featured</Badge> : null}
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">
            {product.brand === "iphone" ? "iPhone" : "Samsung"} • {product.storage_gb}GB
          </div>
          <div className="text-base font-semibold leading-snug">
            {product.model} {product.color ? <span className="text-muted-foreground">({product.color})</span> : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-semibold">
            ฿{product.price_thb.toLocaleString("th-TH")}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className={cn("h-4 w-4", product.average_rating ? "fill-primary text-primary" : "")} />
            <span>{product.average_rating ? product.average_rating.toFixed(1) : "—"}</span>
            <span className="text-xs">({product.review_count})</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>Battery {product.battery_health_percent}%</div>
          <div>{product.warranty_months} mo warranty</div>
        </div>
      </div>
    </article>
  );
}

