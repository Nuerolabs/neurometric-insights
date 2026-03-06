import { Link } from "react-router-dom";
import { Article } from "@/data/articles";

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Link
      to={`/article/${article.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-gold/30"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">{article.date}</span>
        </div>
        <h3 className="font-heading text-lg font-semibold leading-snug text-card-foreground group-hover:text-accent transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
};

export default ArticleCard;
