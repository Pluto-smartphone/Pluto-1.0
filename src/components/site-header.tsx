"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import { Menu, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function BrandChips() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const brand = sp.get("brand");
  const base = pathname?.startsWith("/products") ? "/products" : "/products";

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link href={`${base}?brand=iphone`}>
        <Badge variant={brand === "iphone" ? "default" : "secondary"} className="px-3 py-1">
          iPhone
        </Badge>
      </Link>
      <Link href={`${base}?brand=samsung`}>
        <Badge variant={brand === "samsung" ? "default" : "secondary"} className="px-3 py-1">
          Samsung
        </Badge>
      </Link>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:w-[360px]">
              <SheetHeader>
                <SheetTitle>Pluto</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 grid gap-4">
                <Link href="/" className="text-sm font-medium">
                  Home
                </Link>
                <Link href="/products" className="text-sm font-medium">
                  Shop
                </Link>
                <Link href="/seller" className="text-sm font-medium">
                  Sell
                </Link>
                <Link href="/cart" className="text-sm font-medium">
                  Cart
                </Link>
                <div className="pt-2 text-xs font-medium text-muted-foreground">Brands</div>
                <Link href="/products?brand=iphone" className="text-sm font-medium">
                  iPhone
                </Link>
                <Link href="/products?brand=samsung" className="text-sm font-medium">
                  Samsung
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              P
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold tracking-tight">Pluto</div>
              <div className="text-xs text-muted-foreground">Refurbished smartphones</div>
            </div>
          </Link>
        </div>

        <BrandChips />

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/products">Shop</NavLink>
          <NavLink href="/seller">Sell</NavLink>
          <NavLink href="/trust">Trust</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Cart">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Account">
            <Link href="/auth/sign-in">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/products">Shop deals</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

