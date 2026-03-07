/**
 * NewsletterBox — Institutional-grade email capture form.
 * Placed at the end of each article before the footer.
 */
import { useState } from "react";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">
          Welcome to the Network
        </h3>
        <p className="text-sm text-muted-foreground">
          You'll receive our next intelligence briefing before market open.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-8">
      <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2">
        Join 15,000+ Institutional Investors
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Get our proprietary geopolitical and financial risk models delivered to
        your inbox before the market opens.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-3 max-w-xl"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;
