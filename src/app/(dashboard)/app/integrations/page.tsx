"use client";

import React, { useState } from "react";
import { 
  Key, 
  Settings, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Activity,
  ArrowRight,
  ShieldCheck,
  Globe
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

// Mock Data
const apiKeys = [
  { id: "key_live_1a2b", name: "Production Key", token: "sk_live_94a...29b", created: "Oct 12, 2025", lastUsed: "2 mins ago", status: "Active" },
  { id: "key_test_3c4d", name: "Development Key", token: "sk_test_72x...81c", created: "Sep 04, 2025", lastUsed: "3 days ago", status: "Active" },
];

const webhooks = [
  { id: "wh_1", url: "https://api.acme-corp.com/webhooks/events", status: "Active", events: ["payment.succeeded", "invoice.created"], lastTrigger: "14 mins ago" },
  { id: "wh_2", url: "https://staging.acme-corp.com/hooks", status: "Failing", events: ["*"], lastTrigger: "2 hours ago" },
];

export default function IntegrationsPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 pb-20">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">API & Integrations</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            Manage your API keys, configure webhooks, and connect third-party enterprise integrations. Maintain secure access credentials and monitor API usage logs.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 w-full mt-8">
        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="bg-slate-100/50 p-1 rounded-md border border-slate-200 mb-8 inline-flex">
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-1.5 rounded-sm transition-all">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-1.5 rounded-sm transition-all">Webhooks</TabsTrigger>
            <TabsTrigger value="oauth" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-1.5 rounded-sm transition-all">OAuth Apps</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-1.5 rounded-sm transition-all">Request Logs</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-slate-900">Standard API Keys</h2>
                <p className="text-sm text-slate-500 mt-1">Use these secret keys to authenticate API requests from your backend servers.</p>
              </div>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-md h-9 px-4 text-sm font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Create new secret key
              </Button>
            </div>

            <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider py-4 h-auto">Name</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider py-4 h-auto">Token</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider py-4 h-auto">Created</TableHead>
                    <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider py-4 h-auto">Last Used</TableHead>
                    <TableHead className="text-right py-4 h-auto"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id} className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-slate-400" />
                          {key.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                            {showKeys[key.id] ? key.token.replace("...", "18b9c2a") : key.token}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" onClick={() => toggleKeyVisibility(key.id)}>
                            {showKeys[key.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" onClick={() => handleCopy(key.token, "API Key")}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 py-4">{key.created}</TableCell>
                      <TableCell className="text-sm text-slate-500 py-4">{key.lastUsed}</TableCell>
                      <TableCell className="text-right py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-md shadow-lg border-slate-200">
                            <DropdownMenuItem className="text-sm text-slate-700 cursor-pointer">
                              <RefreshCw className="w-4 h-4 mr-2 text-slate-400" /> Roll key
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-sm text-slate-700 cursor-pointer">
                              <Settings className="w-4 h-4 mr-2 text-slate-400" /> Edit permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem className="text-sm text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" /> Revoke key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="border border-slate-200 shadow-sm rounded-lg bg-white mt-8">
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="text-base font-medium text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                  IP Allowlisting
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Restrict API key usage to specific IP addresses or subnets.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Enforce IP Restrictions</h4>
                    <p className="text-sm text-slate-500 mt-1">When enabled, requests from unlisted IPs will be rejected with a 403 status code.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-slate-900">Webhook Endpoints</h2>
                <p className="text-sm text-slate-500 mt-1">Receive real-time HTTP POST payloads when events occur in your account.</p>
              </div>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-md h-9 px-4 text-sm font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Endpoint
              </Button>
            </div>

            <div className="grid gap-4">
              {webhooks.map((wh) => (
                <Card key={wh.id} className="border border-slate-200 shadow-sm rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${wh.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                          {wh.url}
                        </h3>
                        <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs font-normal px-2 py-0">
                          {wh.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {wh.events.map((evt, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200/60">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500 sm:border-l sm:border-slate-100 sm:pl-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Last trigger</span>
                        <span className="font-medium text-slate-700">{wh.lastTrigger}</span>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50">
                        Manage <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Fallback Empty States for other tabs */}
          <TabsContent value="oauth" className="py-12 animate-in fade-in-50 duration-300">
            <div className="text-center max-w-md mx-auto">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-medium text-slate-900">No OAuth Applications</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">
                Register an OAuth application to allow other users to securely access your data without sharing API keys.
              </p>
              <Button variant="outline" className="border-slate-200 text-slate-700 shadow-sm">
                Register Application
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="py-12 animate-in fade-in-50 duration-300">
             <div className="text-center max-w-md mx-auto">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-medium text-slate-900">API Logs are disabled</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">
                Upgrade your Enterprise plan to retain API request and response logs for up to 30 days.
              </p>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                Upgrade Plan
              </Button>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
