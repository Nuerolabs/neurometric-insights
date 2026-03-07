/**
 * MarketTicker — Bloomberg-style scrolling financial data ribbon.
 * Pure CSS marquee animation; no external libraries.
 */
const tickerItems = [
  { label: "S&P 500", value: "5,120.45", change: "-1.2%", positive: false },
  { label: "BRENT", value: "$85.40", change: "+3.2%", positive: true },
  { label: "WTI", value: "$81.15", change: "+2.8%", positive: true },
  { label: "GOLD", value: "$2,150.00", change: "-0.5%", positive: false },
  { label: "BTC", value: "$64,200", change: "+4.1%", positive: true },
  { label: "US 10-YR", value: "4.25%", change: "", positive: false },
];

const TickerContent = () => (
  <span className="inline-flex items-center gap-6 whitespace-nowrap px-4">
    {tickerItems.map((item, i) => (
      <span key={i} className="inline-flex items-center gap-1.5 text-xs tracking-wide">
        <span className={item.positive ? "text-green-400" : "text-red-400"}>
          {item.positive ? "🟢" : "🔴"}
        </span>
        <span className="font-semibold text-white/90">{item.label}:</span>
        <span className="text-white/70">{item.value}</span>
        {item.change && (
          <span className={item.positive ? "text-green-400" : "text-red-400"}>
            ({item.change})
          </span>
        )}
        {i < tickerItems.length - 1 && (
          <span className="text-white/20 ml-4">|</span>
        )}
      </span>
    ))}
  </span>
);

const MarketTicker = () => {
  return (
    <div className="h-10 bg-[hsl(var(--navy-deep))] border-b border-white/10 overflow-hidden flex items-center">
      <div className="animate-marquee inline-flex">
        {/* Duplicate content for seamless loop */}
        <TickerContent />
        <TickerContent />
      </div>
    </div>
  );
};

export default MarketTicker;
