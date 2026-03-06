import { Link } from "react-router-dom";
import { articles } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  const featured = articles[0];

  return (
    <>
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="divider-gold mb-6" />
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Decoding Global<br />Markets & Tech
            </h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8 max-w-lg">
              Institutional-grade intelligence across finance, technology, health, and macroeconomics — distilled for decision makers.
            </p>
            <Link
              to={`/article/${featured.id}`}
              className="inline-flex items-center gap-2 border-gold border px-5 py-2.5 rounded text-sm font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Read Latest Brief →
            </Link>
          </div>
        </div>
      </section>

      <AdBanner className="container mt-8" />

      {/* Articles Grid */}
      <section className="container py-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-heading text-2xl font-bold text-foreground">Latest Intelligence</h2>
          <div className="divider-gold flex-1" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </section>

      <AdBanner className="container mb-12" />
    </>
  );
};

export default Index;
