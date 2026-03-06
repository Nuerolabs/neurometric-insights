const Footer = () => (
  <footer className="border-t border-border bg-primary text-primary-foreground">
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-heading text-lg font-bold tracking-tight">
            Neuro<span className="text-gradient-gold">Metric</span> Intelligence
          </span>
          <p className="text-sm text-primary-foreground/60 mt-1">Decoding markets with empirical precision.</p>
        </div>
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} NeuroMetric Intelligence. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
