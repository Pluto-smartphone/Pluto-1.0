import { Button } from "@/components/ui/button";
import { TrustBadges } from "@/components/trust-badges";
import { FeaturedProducts } from "@/components/featured-products";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Refurbished smartphones, done right
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              Buy verified refurbished iPhone and Samsung phones with confidence.
            </h1>
            <p className="max-w-prose text-pretty text-muted-foreground">
              Every device is tested, graded, and backed by warranty. See battery
              health up front, buy from verified sellers, and save money while
              reducing e-waste.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="/products">Shop phones</a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="/seller">Sell refurbished</a>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">
              Popular right now
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <a
                className="hover-lift rounded-xl border bg-background p-4"
                href="/products?brand=iphone"
              >
                <div className="font-semibold">iPhone</div>
                <div className="mt-1 text-muted-foreground">Best sellers</div>
              </a>
              <a
                className="hover-lift rounded-xl border bg-background p-4"
                href="/products?brand=samsung"
              >
                <div className="font-semibold">Samsung</div>
                <div className="mt-1 text-muted-foreground">Top value</div>
              </a>
              <a
                className="hover-lift rounded-xl border bg-background p-4"
                href="/products?condition=like_new"
              >
                <div className="font-semibold">Like New</div>
                <div className="mt-1 text-muted-foreground">Near-perfect</div>
              </a>
              <a
                className="hover-lift rounded-xl border bg-background p-4"
                href="/products?sort=best_rating"
              >
                <div className="font-semibold">Best Rated</div>
                <div className="mt-1 text-muted-foreground">Loved picks</div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <TrustBadges />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Featured deals
            </h2>
            <p className="text-sm text-muted-foreground">
              Hand-picked refurbished smartphones from verified sellers.
            </p>
          </div>
          <a className="text-sm font-medium text-primary hover:underline" href="/products">
            View all
          </a>
        </div>
        <FeaturedProducts />
      </section>
    </div>
  );
}

