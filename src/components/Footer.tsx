const Footer = () => (
  <footer className="border-t border-border bg-primary text-primary-foreground">
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-heading text-lg font-bold tracking-tight">
            Cerebro<span className="text-gradient-gold">Quant</span> Intelligence
          </span>
          <p className="text-sm text-primary-foreground/60 mt-1">Decodificando mercados con precisión empírica.</p>
        </div>
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} CerebroQuant Intelligence. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
