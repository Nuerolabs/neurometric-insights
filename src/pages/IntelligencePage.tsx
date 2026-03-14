/**
 * CerebroQuant Intelligence Hub
 * Institutional-grade analytics dashboard with three premium tabs.
 */

import { useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import AdBanner from "@/components/AdBanner";
import NewsletterBox from "@/components/NewsletterBox";
import { TrendingUp, TrendingDown, Brain, Shield, Dna, Coins } from "lucide-react";

/* ── Mock Data ─────────────────────────────────────────────── */

const liquidityData = [
  { month: "Jan", value: 142 }, { month: "Feb", value: 148 },
  { month: "Mar", value: 138 }, { month: "Apr", value: 155 },
  { month: "May", value: 162 }, { month: "Jun", value: 158 },
  { month: "Jul", value: 171 }, { month: "Aug", value: 169 },
  { month: "Sep", value: 178 }, { month: "Oct", value: 185 },
  { month: "Nov", value: 192 }, { month: "Dec", value: 201 },
];

const aiCapFlowData = [
  { month: "Jan", value: 34 }, { month: "Feb", value: 41 },
  { month: "Mar", value: 37 }, { month: "Apr", value: 52 },
  { month: "May", value: 58 }, { month: "Jun", value: 63 },
  { month: "Jul", value: 71 }, { month: "Aug", value: 68 },
  { month: "Sep", value: 79 }, { month: "Oct", value: 86 },
  { month: "Nov", value: 94 }, { month: "Dec", value: 105 },
];

const predictiveSignals = [
  { asset: "US Large-Cap AI", conviction: 94, outlook: "Strong Outperform", signal: "Bullish" },
  { asset: "EU Sovereign Bonds", conviction: 72, outlook: "Underweight", signal: "Bearish" },
  { asset: "Quantum Computing ETF", conviction: 88, outlook: "Accumulate", signal: "Bullish" },
  { asset: "EM Currency Basket", conviction: 61, outlook: "Neutral-Risk", signal: "Bearish" },
  { asset: "Tokenized Real Estate", conviction: 83, outlook: "Overweight", signal: "Bullish" },
  { asset: "Global Commodities", conviction: 77, outlook: "Tactical Long", signal: "Bullish" },
];

const megatrends = [
  {
    icon: Brain,
    title: "AGI Integration",
    summary: "Autonomous general intelligence reshaping enterprise decision-making, capital allocation, and workforce augmentation across every vertical by 2030.",
    probability: 99,
  },
  {
    icon: Shield,
    title: "Quantum Cryptography",
    summary: "Post-quantum encryption protocols becoming the new institutional standard as nation-state threat vectors accelerate beyond classical compute thresholds.",
    probability: 97,
  },
  {
    icon: Dna,
    title: "Longevity Biotech",
    summary: "Senolytics, epigenetic reprogramming, and AI-driven drug discovery converging to extend healthspan, unlocking a $600B addressable market by decade-end.",
    probability: 95,
  },
  {
    icon: Coins,
    title: "Tokenized Real-World Assets",
    summary: "On-chain securitization of real estate, infrastructure, and private credit projected to capture $16T in AUM as regulatory frameworks crystallize globally.",
    probability: 92,
  },
];

/* ── Component ─────────────────────────────────────────────── */

const IntelligencePage = () => {
  useEffect(() => {
    document.title = "CerebroQuant Intelligence Hub | Capital & Code Frontier";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Institutional-grade intelligence hub: alpha signals, megatrend radar, and private research reports for global allocators.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Header ──────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-10 md:py-16 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary-foreground/50 mb-3 font-medium">
            Restricted Access · Institutional Grade
          </p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
            CerebroQuant Intelligence Hub
          </h1>
          <p className="text-sm md:text-base text-primary-foreground/70 max-w-2xl mx-auto">
            The Frontier of Capital & Code — Predictive analytics, megatrend radar,
            and proprietary research for forward-deployed allocators.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12">
        {/* ── Ad placement above tabs ────────────────────── */}
        <AdBanner dataAdSlot="6376311788" className="my-8" />

        {/* ── Tabs ───────────────────────────────────────── */}
        <Tabs defaultValue="alpha" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="alpha" className="flex-1 min-w-[120px] text-xs sm:text-sm">
              Alpha Terminal
            </TabsTrigger>
            <TabsTrigger value="megatrends" className="flex-1 min-w-[120px] text-xs sm:text-sm">
              Megatrends 2030
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 min-w-[120px] text-xs sm:text-sm">
              Private Reports
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Alpha Terminal ───────────────────── */}
          <TabsContent value="alpha" className="space-y-8 mt-6">
            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Global Liquidity Index */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading">
                    Global Liquidity Index
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">2026 Projection · Trillions USD</p>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={liquidityData}>
                        <defs>
                          <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            fontSize: 12,
                          }}
                        />
                        <Area
                          type="monotone" dataKey="value"
                          stroke="hsl(var(--accent))" strokeWidth={2}
                          fill="url(#liqGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AI Sector CapFlow */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading">
                    AI Sector CapFlow
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">2026 Cumulative · Billions USD</p>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aiCapFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone" dataKey="value"
                          stroke="hsl(var(--accent))" strokeWidth={2}
                          dot={{ r: 3, fill: "hsl(var(--accent))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Predictive Signals Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">Live Predictive Signals</CardTitle>
                <p className="text-xs text-muted-foreground">AI-generated conviction scores · Updated Q1 2026</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Class</TableHead>
                      <TableHead>AI Signal</TableHead>
                      <TableHead className="text-right">Conviction</TableHead>
                      <TableHead className="hidden sm:table-cell">12-Month Outlook</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictiveSignals.map((row) => (
                      <TableRow key={row.asset}>
                        <TableCell className="font-medium text-sm">{row.asset}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            row.signal === "Bullish" ? "text-green-500" : "text-red-500"
                          }`}>
                            {row.signal === "Bullish"
                              ? <TrendingUp className="h-3.5 w-3.5" />
                              : <TrendingDown className="h-3.5 w-3.5" />}
                            {row.signal}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{row.conviction}%</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {row.outlook}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 2: Megatrends 2030 ──────────────────── */}
          <TabsContent value="megatrends" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {megatrends.map((trend) => (
                <Card key={trend.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <trend.icon className="h-5 w-5 text-accent" />
                        </div>
                        <CardTitle className="text-lg font-heading">{trend.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-accent/30 text-accent whitespace-nowrap">
                        {trend.probability}% Disruption
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {trend.summary}
                    </p>
                  </CardContent>
                  {/* Decorative accent bar */}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-accent/60 to-accent/10" />
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── Tab 3: Private Reports ──────────────────── */}
          <TabsContent value="reports" className="mt-6 space-y-8">
            <Card className="border-accent/20">
              <CardHeader className="text-center pb-2">
                <Badge variant="outline" className="w-fit mx-auto mb-3 text-[10px] uppercase tracking-widest border-accent/30 text-accent">
                  Exclusive Research
                </Badge>
                <CardTitle className="text-xl md:text-2xl font-heading">
                  Q2 2026 Macroeconomic Thesis
                </CardTitle>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-2">
                  Our proprietary 47-page institutional whitepaper covering global liquidity cycles,
                  AI capex supercycles, and geopolitical risk premia — available exclusively to subscribers.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <NewsletterBox />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Bottom ad placement ────────────────────────── */}
        <AdBanner dataAdSlot="7689393453" className="my-8" />
      </div>
    </div>
  );
};

export default IntelligencePage;
