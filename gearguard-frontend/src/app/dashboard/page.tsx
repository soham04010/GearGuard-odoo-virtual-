"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CalendarCheck, ShieldCheck, Trello, Calendar, HardDrive } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // 1. Fetch Requests - Initialize with fallback empty array []
  const { data: requests = [], isLoading: reqLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: () => fetch(`${API_BASE}/requests`).then((res) => res.json()),
  });

  // 2. Fetch Equipment - Initialize with fallback empty array []
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => fetch(`${API_BASE}/equipment`).then((res) => res.json()),
  });

  // 3. Dynamic Calculations (Now safe because assets/requests are guaranteed arrays)
  const safeAssets = Array.isArray(assets) ? assets : [];
  const safeRequests = Array.isArray(requests) ? requests : [];

  const criticalCount = safeAssets.filter((a: any) => !a.isUsable).length;
  const pendingCount = safeRequests.filter((r: any) => r.status === "New").length;
  const overdueCount = safeRequests.filter((r: any) => 
    r.status !== "Repaired" && 
    r.scheduledDate && 
    new Date(r.scheduledDate) < new Date()
  ).length;

  if (reqLoading || assetsLoading) return <div className="p-10">Syncing with Database...</div>;

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">GearGuard Dashboard</h1>
        <p className="text-slate-500">Live system status from PostgreSQL.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Equipment</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount} Units</div>
            <p className="text-xs text-slate-500 mt-1">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Maintenance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount} Active</div>
            <p className="text-xs text-slate-500 mt-1">{overdueCount} tasks are overdue</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operational Assets</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeAssets.length - criticalCount} / {safeAssets.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Equipment currently usable</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Quick Navigation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/kanban"><ActionCard icon={<Trello/>} title="Kanban Board" desc="Manage repair workflow" color="blue" /></Link>
        <Link href="/calendar"><ActionCard icon={<Calendar/>} title="Preventive Calendar" desc="Schedule routine checks" color="green" /></Link>
        <Link href="/equipment"><ActionCard icon={<HardDrive/>} title="Asset Inventory" desc="View equipment technical details" color="orange" /></Link>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, color }: any) {
  return (
    <Card className="hover:shadow-md transition-all cursor-pointer h-full border-slate-200">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>{icon}</div>
        <div>
          <p className="font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}