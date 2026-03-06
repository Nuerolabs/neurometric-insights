import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { categories } from "@/data/articles";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const socialLinks = [
  { label: "X", href: "#", icon: "𝕏" },
  { label: "LinkedIn", href: "#", icon: "in" },
  { label: "WhatsApp", href: "#", icon: "WA" },
];

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex h-8 items-center justify-between text-xs">
          <time className="hidden sm:block capitalize">{today}</time>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-destructive-foreground animate-pulse">
              ● Último Minuto
            </span>
            <span className="hidden sm:inline text-primary-foreground/50">|</span>
            <div className="hidden sm:flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-5 w-5 items-center justify-center rounded bg-primary-foreground/10 text-[10px] font-bold text-primary-foreground/70 hover:bg-primary-foreground/20 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logo row */}
      <div className="container flex items-center justify-between py-4 md:justify-center md:py-5">
        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden p-1" aria-label="Abrir menú">
            <Menu className="h-6 w-6 text-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card">
            <SheetHeader>
              <SheetTitle className="font-heading text-lg">
                Cerebro<span className="text-gradient-gold">Quant</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded hover:bg-muted transition-colors"
              >
                Inicio
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded transition-colors ${
                    location.pathname === `/category/${cat.toLowerCase()}`
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex flex-col items-center gap-0.5">
          <span className="font-heading text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none">
            Cerebro<span className="text-gradient-gold">Quant</span>
          </span>
          <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
            Intelligence
          </span>
        </Link>

        {/* Spacer for mobile alignment */}
        <div className="w-7 md:hidden" />
      </div>

      {/* Category nav — desktop */}
      <nav className="hidden md:block border-t border-border">
        <div className="container flex items-center justify-center gap-1 py-1.5">
          {categories.map((cat) => {
            const isActive = location.pathname === `/category/${cat.toLowerCase()}`;
            return (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase()}`}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
