import { useEffect } from "react";
import { Activity, TrendingUp, TrendingDown, Brain, Droplets, BarChart3, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import AdBanner from "@/components/AdBanner";

/* ── Mock Data ─────────────────────────────────────────── */

const metricCards = [
  { title: "Global AI Index", value: "1,842.6", change: +3.7, icon: Brain },
  { title: "Longevity Biotech ETF", value: "$47.32", change: -1.2, icon: Activity },
  { title: "Global Liquidity (T)", value: "$168.4T", change: +0.8, icon: Droplets },
  { title: "Fear & Greed Sentiment", value: "62 — Greed", change: +5.1, icon: ShieldAlert },
];

const macroData = [
  { month: "Jan", projection: 4200, baseline: 4100 },
  { month: "Feb", projection: 4350, baseline: 4120 },
  { month: "Mar", projection: 4280, baseline: 4150 },
  { month: "Apr", projection: 4510, baseline: 4180 },
  { month: "May", projection: 4620, baseline: 4200 },
  { month: "Jun", projection: 4580, baseline: 4230 },
  { month: "Jul", projection: 4750, baseline: 4260 },
  { month: "Aug", projection: 4890, baseline: 4290 },
  { month: "Sep", projection: 4820, baseline: 4310 },
  { month: "Oct", projection: 5010, baseline: 4340 },
  { month: "Nov", projection: 5150, baseline: 4370 },
  { month: "Dec", projection: 5320, baseline: 4400 },
];

const chartConfig: ChartConfig = {
  projection: { label: "CQ Projection", color: "hsl(43 74% 49%)" },
  baseline: { label: "Baseline", color: "hsl(215 16% 47%)" },
};

const sectorHeatmap = [
  { sector: "Finance & DeFi", sentiment: 78, trend: "up" as const },
  { sector: "Quantum Computing", sentiment: 65, trend: "up" as const },
  { sector: "Genomics & CRISPR", sentiment: 52, trend: "down" as const },
  { sector: "Supply Chain AI", sentiment: 71, trend: "up" as const },
  { sector: "Cybersecurity", sentiment: 84, trend: "up" as const },
  { sector: "Climate Tech", sentiment: 43, trend: "down" as const },
];

const alphaSignals = [
  { asset: "NVIDIA (NVDA)", signal: "Bullish", confidence: 92, quarter: "Q2 2026" },
  { asset: "Quantum Computing ETF", signal: "Bullish", confidence: 78, quarter: "Q3 2026" },
  { asset: "EU Sovereign Bonds", signal: "Bearish", confidence: 67, quarter: "Q2 2026" },
  { asset: "Longevity Biotech Basket", signal: "Bullish", confidence: 85, quarter: "Q4 2026" },
  { asset: "Crude Oil (WTI)", signal: "Bearish", confidence: 71, quarter: "Q2 2026" },
  { asset: "Gold (XAU/USD)", signal: "Bullish", confidence: 88, quarter: "Q3 2026" },
  { asset: "US Regional Banks", signal: "Bearish", confidence: 63, quarter: "Q2 2026" },
];

/* ── Component ─────────────────────────────────────────── */

const TerminalPage = () => {
  useEffect(() => {
    document.title = "CerebroQuant Terminal | Real-Time Market & Tech Intelligence";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Institutional-grade predictive analytics, sector heatmaps, and macro signals for global allocators.");
    }
  }, []);

  return (
    <section className="container py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-5 w-5 text-accent" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            CerebroQuant Analytics Terminal
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Institutional-grade macro intelligence & predictive signals — Updated March 2026
        </p>
        <div className="divider-gold mt-3" />
      </div>

      {/* ── Top Section: Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          const isPositive = m.change > 0;
          return (
            <Card key={m.title} className="bg-card border-border">
              <CardContent className="p-4 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{m.title}</p>
                  <p className="font-heading text-xl font-bold text-foreground">{m.value}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPositive ? "+" : ""}{m.change}%
                  </span>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Ad between sections ── */}
      <AdBanner dataAdSlot="6376311788" className="my-6" />

      {/* ── Middle Section: Chart + Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">CerebroQuant Macro Trend Projection — 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={macroData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="hsl(215 16% 47%)"
                  fill="hsl(215 16% 47% / 0.1)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="projection"
                  stroke="hsl(43 74% 49%)"
                  fill="hsl(43 74% 49% / 0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sector Heatmap */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              <CardTitle className="font-heading text-lg">AI Sector Sentiment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorHeatmap.map((s) => (
              <div key={s.sector} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{s.sector}</span>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${s.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    {s.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {s.sentiment}%
                  </span>
                </div>
                <Progress
                  value={s.sentiment}
                  className="h-2 bg-muted"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Section: Alpha Signals Table ── */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg">Predictive Alpha Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset / Sector</TableHead>
                <TableHead>AI Signal</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="hidden sm:table-cell">Target Quarter</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alphaSignals.map((row) => (
                <TableRow key={row.asset}>
                  <TableCell className="font-medium text-foreground">{row.asset}</TableCell>
                  <TableCell>
                    <Badge
                      variant={row.signal === "Bullish" ? "default" : "destructive"}
                      className={row.signal === "Bullish" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                      {row.signal}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.confidence} className="h-1.5 w-16 bg-muted" />
                      <span className="text-xs text-muted-foreground">{row.confidence}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{row.quarter}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Bottom Ad ── */}
      <AdBanner dataAdSlot="7689393453" className="my-6" />
    </section>
  );
};

export default TerminalPage;
