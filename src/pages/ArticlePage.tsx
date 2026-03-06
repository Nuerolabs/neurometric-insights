import { useParams, Link } from "react-router-dom";
import { articles } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Article Not Found</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">Return home</Link>
      </div>
    );
  }

  const readNext = articles.filter((a) => a.id !== id && a.category === article.category).slice(0, 2);
  if (readNext.length < 2) {
    const more = articles.filter((a) => a.id !== id && a.category !== article.category).slice(0, 2 - readNext.length);
    readNext.push(...more);
  }

  return (
    <article className="container py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Home
        </Link>

        <div className="mt-6 mb-4 flex items-center gap-3">
          <Link
            to={`/category/${article.category.toLowerCase()}`}
            className="text-xs font-semibold uppercase tracking-widest text-accent hover:underline"
          >
            {article.category}
          </Link>
          <span className="text-xs text-muted-foreground">{article.date}</span>
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
          {article.title}
        </h1>

        <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
          <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
        </div>

        <AdBanner className="mb-8" />

        <div
          className="prose prose-lg max-w-none text-foreground/90 leading-relaxed [&_p]:mb-5"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <AdBanner className="mt-10 mb-10" />
      </div>

      {/* Read Next */}
      {readNext.length > 0 && (
        <div className="max-w-3xl mx-auto mt-12 border-t border-border pt-10">
          <h2 className="font-heading text-xl font-bold text-foreground mb-6">Read Next</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {readNext.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default ArticlePage;
