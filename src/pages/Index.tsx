import { Link } from "react-router-dom";
import { articles } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  const featured = articles[0];
  const latestNews = articles.slice(1, 6);
  const moreArticles = articles.slice(1);

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-6">
        {/* Left sidebar — Últimas Noticias */}
        <aside className="hidden lg:block">
          <div className="sticky top-[160px]">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
              <span className="h-px flex-1 bg-accent/30" />
              Últimas
              <span className="h-px flex-1 bg-accent/30" />
            </h3>
            <ul className="space-y-4">
              {latestNews.map((a, i) => (
                <li key={a.id}>
                  <Link
                    to={`/article/${a.id}`}
                    className="group flex gap-3 items-start"
                  >
                    <span className="font-heading text-2xl font-bold text-muted-foreground/40 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                        {a.category}
                      </span>
                      <p className="text-xs font-medium text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-3 mt-0.5">
                        {a.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center — Main content */}
        <div className="min-w-0">
          {/* Hero */}
          <Link
            to={`/article/${featured.id}`}
            className="group block overflow-hidden rounded-lg border border-border bg-card mb-8"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {featured.category}
                </span>
                <span className="text-xs text-muted-foreground">{featured.date}</span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-card-foreground leading-tight group-hover:text-accent transition-colors mb-3">
                {featured.title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>
            </div>
          </Link>

          <AdBanner className="mb-8" />

          {/* Articles grid */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-heading text-xl font-bold text-foreground whitespace-nowrap">
              Últimas Noticias
            </h2>
            <div className="divider-gold flex-1" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {moreArticles.map((article, i) => (
              <div
                key={article.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          <AdBanner className="mt-8" />
        </div>

        {/* Right sidebar — Ads & Featured */}
        <aside className="hidden lg:block">
          <div className="sticky top-[160px] space-y-6">
            {/* 300x250 ad slot */}
            <div className="flex items-center justify-center rounded border border-dashed border-border bg-muted/30 text-[10px] text-muted-foreground tracking-widest uppercase"
              style={{ width: 300, height: 250 }}
            >
              Ad 300×250
            </div>

            {/* Featured */}
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-accent mb-4">
                Destacado
              </h3>
              <ul className="space-y-4">
                {articles.slice(5, 8).map((a) => (
                  <li key={a.id}>
                    <Link
                      to={`/article/${a.id}`}
                      className="group flex gap-3"
                    >
                      <img
                        src={a.image}
                        alt={a.title}
                        className="h-16 w-16 rounded object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                          {a.category}
                        </span>
                        <p className="text-xs font-medium text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2 mt-0.5">
                          {a.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 300x600 ad slot */}
            <div className="flex items-center justify-center rounded border border-dashed border-border bg-muted/30 text-[10px] text-muted-foreground tracking-widest uppercase"
              style={{ width: 300, height: 600 }}
            >
              Ad 300×600
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
