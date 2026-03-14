"use client";

import * as React from "react";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/products";

export function FeaturedProducts() {
  const [items, setItems] = React.useState(() => getFeaturedProducts());

  // Placeholder: once Supabase is wired, switch to server component fetch.
  React.useEffect(() => {
    setItems(getFeaturedProducts());
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((p) => (
        <Link key={p.id} href={`/products/${p.id}`} className="block">
          <ProductCard product={p} />
        </Link>
      ))}
    </div>
  );
}

