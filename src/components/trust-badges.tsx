import { BadgeCheck, Leaf, ShieldCheck, Wrench } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Warranty included",
    desc: "Clear warranty terms on every device.",
  },
  {
    icon: Wrench,
    title: "Tested & graded",
    desc: "Condition grades you can understand.",
  },
  {
    icon: BadgeCheck,
    title: "Verified sellers",
    desc: "Seller verification for higher trust.",
  },
  {
    icon: Leaf,
    title: "Eco-friendly",
    desc: "Reduce e-waste by buying refurbished.",
  },
];

export function TrustBadges() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <it.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-sm text-muted-foreground">{it.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

