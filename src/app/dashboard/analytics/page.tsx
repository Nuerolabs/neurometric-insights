"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Clock,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Lightbulb,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// ==========================================
// DATASETS
// ==========================================

const monthlyTrendsData = [
  { month: "Jan", leads: 4200, qualified: 1150, revenue: 142000, cost: 3200, roi: 443, responseTime: 580, conversion: 14.2 },
  { month: "Feb", leads: 5100, qualified: 1420, revenue: 178000, cost: 3400, roi: 523, responseTime: 520, conversion: 15.1 },
  { month: "Mar", leads: 6400, qualified: 1890, revenue: 215000, cost: 3800, roi: 565, responseTime: 490, conversion: 16.4 },
  { month: "Apr", leads: 7900, qualified: 2310, revenue: 260000, cost: 4100, roi: 634, responseTime: 460, conversion: 17.0 },
  { month: "May", leads: 9800, qualified: 2950, revenue: 310000, cost: 4400, roi: 704, responseTime: 430, conversion: 17.9 },
  { month: "Jun", leads: 11600, qualified: 3480, revenue: 368000, cost: 4650, roi: 791, responseTime: 410, conversion: 18.2 },
  { month: "Jul", leads: 13200, qualified: 3910, revenue: 412000, cost: 4850, roi: 849, responseTime: 395, conversion: 18.5 },
  { month: "Aug", leads: 14892, qualified: 4420, revenue: 485000, cost: 5100, roi: 950, responseTime: 385, conversion: 19.1 },
];

const daily30DaysData = [
  { day: "D1", leads: 380, qualified: 110, responseTime: 440, bookings: 22, roiDaily: 12400 },
  { day: "D4", leads: 410, qualified: 125, responseTime: 420, bookings: 27, roiDaily: 14100 },
  { day: "D7", leads: 460, qualified: 140, responseTime: 410, bookings: 31, roiDaily: 16200 },
  { day: "D10", leads: 490, qualified: 155, responseTime: 395, bookings: 34, roiDaily: 17800 },
  { day: "D13", leads: 520, qualified: 168, responseTime: 390, bookings: 38, roiDaily: 19500 },
  { day: "D16", leads: 580, qualified: 182, responseTime: 385, bookings: 42, roiDaily: 21200 },
  { day: "D19", leads: 610, qualified: 195, responseTime: 380, bookings: 46, roiDaily: 23400 },
  { day: "D22", leads: 645, qualified: 210, responseTime: 375, bookings: 49, roiDaily: 24800 },
  { day: "D25", leads: 690, qualified: 228, responseTime: 370, bookings: 53, roiDaily: 27100 },
  { day: "D28", leads: 740, qualified: 245, responseTime: 365, bookings: 58, roiDaily: 29800 },
  { day: "D30", leads: 785, qualified: 262, responseTime: 360, bookings: 62, roiDaily: 32000 },
];

const channelBreakdown = [
  { name: "Organic Search", value: 7743, percentage: 52, color: "#0f172a", growth: "+34.2%" },
  { name: "Direct Traffic", value: 3872, percentage: 26, color: "#334155", growth: "+19.8%" },
  { name: "Paid Social", value: 2085, percentage: 14, color: "#64748b", growth: "+44.1%" },
  { name: "Email Marketing", value: 1192, percentage: 8, color: "#94a3b8", growth: "+12.5%" },
];

const conversionFunnelData = [
  { stage: "1. Website Visitors", count: 24500, dropoff: "0%", rate: "100%" },
  { stage: "2. Engaged Users", count: 23150, dropoff: "-5.5%", rate: "94.5%" },
  { stage: "3. Qualified Leads (MQL)", count: 14892, dropoff: "-35.7%", rate: "60.8%" },
  { stage: "4. Demo Scheduled", count: 4120, dropoff: "-72.3%", rate: "27.6%" },
  { stage: "5. Closed Deals", count: 1435, dropoff: "-65.2%", rate: "9.6%" },
];

const recentConversions = [
  {
    id: "OPP-9428",
    leadName: "Valentina Morales",
    company: "Fintech Horizon Corp",
    channel: "Organic Search",
    score: 98,
    dealEstimate: "$48,000",
    status: "Demo Scheduled",
    time: "2m ago",
  },
  {
    id: "OPP-9427",
    leadName: "Marcus Vance",
    company: "Nexus Logistics Global",
    channel: "Direct Traffic",
    score: 94,
    dealEstimate: "$32,500",
    status: "Contract Sent",
    time: "7m ago",
  },
  {
    id: "OPP-9426",
    leadName: "Elena Rostova",
    company: "AeroTech Dynamics",
    channel: "Paid Social",
    score: 91,
    dealEstimate: "$75,000",
    status: "Qualified SQL",
    time: "14m ago",
  },
  {
    id: "OPP-9425",
    leadName: "David Chen",
    company: "Apex Cloud Systems",
    channel: "Organic Search",
    score: 99,
    dealEstimate: "$110,000",
    status: "Demo Scheduled",
    time: "21m ago",
  },
];

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 shadow-md rounded-md">
        <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-600">{item.name}:</span>
              <span className="font-semibold text-slate-900">
                {prefix}
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [activeChannel, setActiveChannel] = useState<string>("all");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Executive Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor key performance indicators, pipeline velocity, and conversion metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] bg-white text-sm">
                <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activeChannel} onValueChange={setActiveChannel}>
              <SelectTrigger className="w-[160px] bg-white text-sm">
                <Filter className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="organic">Organic Search</SelectItem>
                <SelectItem value="direct">Direct Traffic</SelectItem>
                <SelectItem value="social">Paid Social</SelectItem>
                <SelectItem value="email">Email Marketing</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="default" size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </header>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">$485,000</div>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">14,892</div>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12.4% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">385ms</div>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                -85ms faster than average
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">19.1%</div>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                +4.2% from last month
              </p>
            </CardContent>
          </Card>
        </section>

        {/* NOTIFICATION BANNER */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="rounded-full bg-blue-50 p-2 text-blue-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900">Weekly Performance Insight</h4>
              <p className="text-sm text-slate-500 mt-0.5">
                Organic Search conversion rate grew by 2.4% over the last 14 days, driving an estimated $42,000 in additional pipeline.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-sm">
            View Details
          </Button>
        </div>

        {/* TABS */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="overview" className="text-sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-sm">
              <Users className="mr-2 h-4 w-4" />
              Acquisition
            </TabsTrigger>
            <TabsTrigger value="conversion" className="text-sm">
              <Target className="mr-2 h-4 w-4" />
              Pipeline Funnel
            </TabsTrigger>
          </TabsList>

          {/* TAB: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Revenue vs Lead Volume</CardTitle>
                  <CardDescription>Monthly progression of closed revenue and total lead volume.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                        <Line yAxisId="right" type="monotone" dataKey="leads" name="Total Leads" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Channel Distribution</CardTitle>
                  <CardDescription>Distribution of incoming leads by channel.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-[320px]">
                  <div className="h-[200px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {channelBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip suffix=" leads" />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {channelBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-slate-900">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: ACQUISITION */}
          <TabsContent value="leads" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Daily Acquisition Velocity</CardTitle>
                  <CardDescription>Daily progression of captured leads vs qualified MQLs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={daily30DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="leads" name="Total Leads" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="qualified" name="Qualified (MQL)" fill="#0f172a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Geographic Distribution</CardTitle>
                  <CardDescription>Lead traffic origins and performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { region: "North America", share: 44, volume: "6,552" },
                      { region: "Europe", share: 36, volume: "5,361" },
                      { region: "Latin America", share: 14, volume: "2,084" },
                      { region: "Asia-Pacific", share: 6, volume: "895" },
                    ].map((geo, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{geo.region}</span>
                          <span className="text-slate-500">{geo.volume} leads</span>
                        </div>
                        <Progress value={geo.share} className="h-2 bg-slate-100 [&>div]:bg-slate-900" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: PIPELINE FUNNEL */}
          <TabsContent value="conversion" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Full-Funnel Pipeline</CardTitle>
                <CardDescription>Step-by-step conversion from visitor to closed-won deal.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-3xl">
                  {conversionFunnelData.map((stage, idx) => (
                    <div key={idx} className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <span className="text-sm font-medium text-slate-900">{stage.stage}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">Volume: <strong className="text-slate-900">{stage.count.toLocaleString()}</strong></span>
                          <span className="text-slate-500">Rate: <strong className="text-slate-900">{stage.rate}</strong></span>
                        </div>
                      </div>
                      <Progress
                        value={(stage.count / 24500) * 100}
                        className="h-2 bg-slate-100 [&>div]:bg-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* LIVE ACTIVITY FEED */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Recent Opportunities</CardTitle>
              <CardDescription>High-intent enterprise prospects currently active in the pipeline.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-3 font-medium">Prospect</th>
                    <th className="pb-3 font-medium">Channel</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Est. Value</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentConversions.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <div className="font-medium text-slate-900">{lead.leadName}</div>
                        <div className="text-xs text-slate-500">{lead.company}</div>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-600">{lead.channel}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-slate-900">{lead.score}/100</span>
                      </td>
                      <td className="py-3 font-medium text-slate-900">{lead.dealEstimate}</td>
                      <td className="py-3">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-slate-500 text-xs">
                        {lead.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
