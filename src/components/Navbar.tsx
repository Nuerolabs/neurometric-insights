import { Link, useLocation } from "react-router-dom";
import { categories } from "@/data/articles";

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <span className="font-heading text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="font-heading text-lg font-bold text-foreground tracking-tight">
            Neuro<span className="text-gradient-gold">Metric</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {categories.map((cat) => {
            const isActive = location.pathname === `/category/${cat.toLowerCase()}`;
            return (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase()}`}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </nav>

        <div className="flex md:hidden">
          <Link to="/" className="text-sm font-medium text-muted-foreground">
            Menu
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
