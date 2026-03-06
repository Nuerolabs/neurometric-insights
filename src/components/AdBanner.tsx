const AdBanner = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded border border-dashed border-border bg-muted/50 py-4 text-xs text-muted-foreground tracking-wide uppercase ${className}`}>
    Advertisement
  </div>
);

export default AdBanner;
