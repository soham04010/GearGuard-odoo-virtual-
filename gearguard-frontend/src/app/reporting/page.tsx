"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Activity, Users, CheckCircle2 } from "lucide-react";

export default function ReportingPage() {
  // 1. Fetch Machine-Specific Risks
  const { data: highRisk = [] } = useQuery({
    queryKey: ["reports-high-risk"],
    queryFn: () => fetch(`${API_BASE}/reports/high-risk`).then(res => res.json())
  });

  // 2. Fetch Team Efficiency Stats
  const { data: teamStats = [], isLoading } = useQuery({
    queryKey: ["team-performance"],
    queryFn: () => fetch(`${API_BASE}/reports/team-performance`).then(res => res.json())
  });

  if (isLoading) return <div className="p-10 text-center font-medium">Analyzing live data...</div>;

  return (
    <div className="p-8 space-y-12 bg-slate-50 min-h-screen">
      {/* --- SECTION 1: TEAM PERFORMANCE ANALYTICS (NOW VISIBLE) --- */}
      <div>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Team Performance Analytics</h1>
          <p className="text-slate-500 font-medium">Efficiency tracking: Repaired tasks vs. cumulative downtime.</p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {teamStats.length > 0 ? (
            teamStats.map((team: any) => (
              <Card key={team.teamName} className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b flex flex-row items-center justify-between py-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="text-blue-600" size={20} />
                    {team.teamName || "Unassigned Team"}
                  </CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">Live Metrics</Badge>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                        <span>Tasks Repaired</span>
                        <span className="text-blue-600 font-bold">{team.repairedCount}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-1000" 
                          style={{ width: `${Math.min((team.repairedCount / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                        <span>Downtime Logged</span>
                        <span className="text-red-500 font-bold">{team.totalDowntime || 0} hrs</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-400 h-full transition-all duration-1000" 
                          style={{ width: `${Math.min((team.totalDowntime / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <CheckCircle2 className="mx-auto text-green-500 mb-1" size={20} />
                      <p className="text-2xl font-bold text-slate-800">{team.repairedCount}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Success Rate</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <Clock className="mx-auto text-orange-500 mb-1" size={20} />
                      <p className="text-2xl font-bold text-slate-800">{team.totalDowntime || 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Labor Hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-slate-400 italic text-center py-10">No team activity data available yet.</p>
          )}
        </div>
      </div>

      {/* --- SECTION 2: HIGH-RISK ASSET OVERSIGHT --- */}
      <div>
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">High-Risk Asset Oversight</h2>
          <p className="text-slate-500 font-medium">Equipment with the highest breakdown frequency.</p>
        </header>
        <div className="grid grid-cols-1 gap-4">
          {highRisk.map((machine: any) => (
            <Card key={machine.id} className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all bg-white">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{machine.name}</h3>
                    <p className="text-xs text-slate-400 font-mono uppercase">{machine.serialNumber}</p>
                  </div>
                </div>

                <div className="flex gap-12 text-center">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Failures</p>
                    <div className="flex items-center gap-2 justify-center">
                      <Activity size={14} className="text-blue-500" />
                      <span className="text-xl font-bold text-slate-800">{machine.totalRequests}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Downtime</p>
                    <div className="flex items-center gap-2 justify-center">
                      <Clock size={14} className="text-red-500" />
                      <span className="text-xl font-bold text-slate-800">{machine.totalDuration || 0} hrs</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge className={machine.totalRequests > 3 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}>
                      {machine.totalRequests > 3 ? "CRITICAL RISK" : "MONITORING"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}