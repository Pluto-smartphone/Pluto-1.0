import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8 md:grid-cols-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Pluto</div>
          <p className="text-sm text-muted-foreground">
            Refurbished iPhone & Samsung marketplace with warranty and verified sellers.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Shop</div>
          <div className="grid gap-1 text-sm text-muted-foreground">
            <Link href="/products?brand=iphone" className="hover:text-foreground">
              iPhone
            </Link>
            <Link href="/products?brand=samsung" className="hover:text-foreground">
              Samsung
            </Link>
            <Link href="/products?sort=best_rating" className="hover:text-foreground">
              Best rated
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Trust</div>
          <div className="grid gap-1 text-sm text-muted-foreground">
            <Link href="/trust" className="hover:text-foreground">
              Condition grading
            </Link>
            <Link href="/trust#warranty" className="hover:text-foreground">
              Warranty
            </Link>
            <Link href="/trust#battery" className="hover:text-foreground">
              Battery health
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Company</div>
          <div className="grid gap-1 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/data-deletion" className="hover:text-foreground">
              Data deletion
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <div>© {new Date().getFullYear()} Pluto. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

