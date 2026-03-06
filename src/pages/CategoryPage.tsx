import { useParams, Link } from "react-router-dom";
import { articles } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();
  const categoryName = name ? name.charAt(0).toUpperCase() + name.slice(1) : "";
  const filtered = articles.filter(
    (a) => a.category.toLowerCase() === name?.toLowerCase()
  );

  return (
    <section className="container py-12">
      <div className="mb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Home
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground mt-4">{categoryName}</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} intelligence briefs</p>
        <div className="divider-gold mt-4" />
      </div>

      <AdBanner className="mb-8" />

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, i) => (
            <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-20 text-center">No articles found for this category.</p>
      )}
    </section>
  );
};

export default CategoryPage;
