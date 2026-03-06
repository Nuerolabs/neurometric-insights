import { useParams, Link } from "react-router-dom";
import { articles } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import AdBanner from "@/components/AdBanner";

const ShareButtons = ({ title }: { title: string }) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="fixed left-4 top-1/3 z-30 hidden xl:flex flex-col gap-3">
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md hover:scale-110 transition-transform"
        aria-label="Compartir en WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.704-1.393A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.16 0-4.16-.68-5.803-1.836l-.244-.166-3.063.907.84-3.137-.178-.258A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-md hover:scale-110 transition-transform"
        aria-label="Compartir en X"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A66C2] text-white shadow-md hover:scale-110 transition-transform"
        aria-label="Compartir en LinkedIn"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
    </div>
  );
};

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Artículo no encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  // Insert ad banners every 3 paragraphs
  const paragraphs = article.content.split("</p>");
  let richContent = "";
  paragraphs.forEach((p, i) => {
    if (!p.trim()) return;
    richContent += p + "</p>";
    if ((i + 1) % 3 === 0 && i < paragraphs.length - 1) {
      richContent += `<div class="ad-inline-placeholder my-6 flex items-center justify-center rounded border border-dashed border-border bg-muted/50 py-4 text-xs text-muted-foreground tracking-wide uppercase">AD — Horizontal Banner</div>`;
    }
  });

  // Key points from excerpt
  const keyPoints = [
    article.excerpt,
    `Categoría: ${article.category}`,
    `Publicado el ${article.date}`,
  ];

  // Related articles: same category first, then fill
  const related = articles.filter((a) => a.id !== id && a.category === article.category);
  const otherRelated = articles.filter((a) => a.id !== id && a.category !== article.category);
  const readMore = [...related, ...otherRelated].slice(0, 3);

  // Most read (simulated)
  const mostRead = articles.filter((a) => a.id !== id).slice(0, 5);

  return (
    <>
      <ShareButtons title={article.title} />

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <span>/</span>
          <Link to={`/category/${article.category.toLowerCase()}`} className="hover:text-foreground transition-colors">{article.category}</Link>
          <span>/</span>
          <span className="text-foreground/60 truncate max-w-[200px]">{article.title}</span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main content — 70% */}
          <article className="min-w-0">
            {/* Category & date */}
            <div className="mb-3 flex items-center gap-3">
              <Link
                to={`/category/${article.category.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-widest text-accent hover:underline"
              >
                {article.category}
              </Link>
              <span className="text-xs text-muted-foreground">{article.date}</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-tight mb-6">
              {article.title}
            </h1>

            {/* Mobile share buttons */}
            <div className="flex xl:hidden gap-2 mb-6">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title)}%20${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex h-8 items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-xs text-white font-medium"
              >WhatsApp</a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs text-background font-medium"
              >X</a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex h-8 items-center gap-1.5 rounded-full bg-[#0A66C2] px-3 text-xs text-white font-medium"
              >LinkedIn</a>
            </div>

            {/* Hero image */}
            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
              <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
            </div>

            {/* Key points */}
            <div className="mb-8 rounded-lg border border-accent/30 bg-accent/5 p-5">
              <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-accent mb-3">Puntos Clave</h3>
              <ul className="space-y-2">
                {keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Article body with inline ads */}
            <div
              className="prose prose-lg max-w-none text-foreground/90 leading-relaxed [&_p]:mb-5"
              dangerouslySetInnerHTML={{ __html: richContent }}
            />

            <AdBanner className="mt-10 mb-6" />
          </article>

          {/* Right sidebar — 30% */}
          <aside className="hidden lg:block">
            <div className="sticky top-[160px] space-y-8">
              {/* Ad 300x600 */}
              <div className="flex items-center justify-center rounded border border-dashed border-border bg-muted/30 text-xs text-muted-foreground tracking-wide uppercase" style={{ width: 300, height: 600 }}>
                AD — 300×600
              </div>

              {/* Most read */}
              <div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                  <span className="h-px flex-1 bg-accent/30" />
                  Más Leídas
                  <span className="h-px flex-1 bg-accent/30" />
                </h3>
                <ul className="space-y-4">
                  {mostRead.map((a, i) => (
                    <li key={a.id}>
                      <Link to={`/article/${a.id}`} className="group flex gap-3 items-start">
                        <span className="font-heading text-lg font-bold text-muted-foreground/40 leading-none">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex gap-2 flex-1 min-w-0">
                          <img src={a.image} alt={a.title} className="h-14 w-14 rounded object-cover shrink-0" />
                          <span className="text-xs font-medium text-foreground/80 group-hover:text-accent transition-colors leading-snug line-clamp-3">
                            {a.title}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ad 300x250 */}
              <div className="flex items-center justify-center rounded border border-dashed border-border bg-muted/30 text-xs text-muted-foreground tracking-wide uppercase" style={{ width: 300, height: 250 }}>
                AD — 300×250
              </div>
            </div>
          </aside>
        </div>

        {/* Read More — 3 columns */}
        {readMore.length > 0 && (
          <div className="mt-14 border-t border-border pt-10">
            <h2 className="font-heading text-xl font-bold text-foreground mb-6">Leer Más</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {readMore.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArticlePage;
