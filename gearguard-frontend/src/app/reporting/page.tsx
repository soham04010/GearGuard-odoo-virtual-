"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Activity, Users, CheckCircle2, ClipboardCheck, Sparkles, CheckSquare, Send, Download } from "lucide-react";

export default function ReportingPage() {
  const [checklist, setChecklist] = useState({
    users: false,
    assets: false,
    logs: false
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const allChecked = checklist.users && checklist.assets && checklist.logs;

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

  const submitAuditReport = async () => {
    if (!allChecked) return;
    if (!currentUser?.id) return alert("You must be logged in to publish an audit report.");

    try {
      const response = await fetch(`${API_BASE}/audit-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          action: "Safety Audit",
          details: "Compliance audit successfully completed. Operators verified, assets validated, and system ledger reviews complete. MARKED COMPLIANT."
        })
      });

      if (response.ok) {
        alert("Compliance Audit Report successfully published and registered in the system ledger!");
        setChecklist({ users: false, assets: false, logs: false });
      } else {
        alert("Failed to register compliance report in ledger.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending request to backend.");
    }
  };

  const exportRiskCSV = () => {
    if (highRisk.length === 0) return alert("No risk records to export!");

    const headers = ["Asset Name", "Serial Number", "Total Failures", "Total Downtime (hrs)", "Oversight Level"];
    const rows = highRisk.map((machine: any) => [
      machine.name,
      machine.serialNumber,
      machine.totalRequests,
      machine.totalDuration || 0,
      machine.totalRequests > 3 ? "CRITICAL RISK" : "MONITORING"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gearguard_high_risk_assets_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-10 text-center font-medium">Analyzing live data...</div>;

  return (
    <div className="p-8 space-y-10 bg-slate-50 min-h-screen text-left">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck size={28} className="text-blue-600" /> Compliance & Reporting
          </h1>
          <p className="text-sm text-slate-500">Live indicators, facility performance analysis, and auditor safety checks.</p>
        </div>
      </header>

      {/* COMPLIANCE CHECKLIST PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <Card className="border border-slate-200 shadow-sm bg-white p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-850">Compliance Audit Checklist</h2>
            </div>
            <p className="text-sm text-slate-500">Perform standard compliance audits. Once all items are checked, publish the audit report to seal it in the immutable system ledger.</p>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.users}
                  onChange={(e) => setChecklist({...checklist, users: e.target.checked})}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800 block">Operator Verification</span>
                  <span className="text-xs text-slate-400">Verify all system operators have valid, authorized role-based directory entries.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.assets}
                  onChange={(e) => setChecklist({...checklist, assets: e.target.checked})}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800 block">Asset Serial Integrity</span>
                  <span className="text-xs text-slate-400">Validate high-risk asset serial numbers against physical hardware tags.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={checklist.logs}
                  onChange={(e) => setChecklist({...checklist, logs: e.target.checked})}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800 block">Ledger Review</span>
                  <span className="text-xs text-slate-400">Inspect the immutable system audit logs for any discrepancies or unauthorized overrides.</span>
                </div>
              </label>
            </div>

            <Button 
              onClick={submitAuditReport}
              disabled={!allChecked}
              className={`w-full py-6 font-bold uppercase transition-all duration-300 ${
                allChecked ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <Send size={16} className="mr-2" />
              Publish Compliance Audit Report
            </Button>
          </div>
        </Card>

        {/* STATUS BRIEF */}
        <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/40 to-indigo-50/20 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Facility Compliance Status</h3>
            <div className="space-y-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                allChecked ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                <Sparkles size={12} className={allChecked ? "animate-spin" : ""} />
                {allChecked ? "READY TO CERTIFY" : "PENDING AUDIT"}
              </span>
              <p className="text-3xl font-extrabold text-slate-850">
                {allChecked ? "100% Verified" : "Audit In Progress"}
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upon publishing the report, a permanent compliance log event will be sealed under your User ID in the System Ledger.
            </p>
          </div>
          <div className="text-slate-400 text-[10px] font-mono border-t pt-4">
            Auditor ID: {currentUser?.id || "Not Authenticated"}
          </div>
        </Card>
      </div>

      {/* --- SECTION 1: TEAM PERFORMANCE ANALYTICS --- */}
      <div className="pt-4">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Team Performance Analytics</h2>
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">High-Risk Asset Oversight</h2>
            <p className="text-slate-500 font-medium">Equipment with the highest breakdown frequency.</p>
          </div>
          <Button onClick={exportRiskCSV} variant="outline" className="border-slate-200 flex items-center gap-2 hover:bg-slate-100 font-bold self-start sm:self-auto">
            <Download size={16} /> Export Risk Report (CSV)
          </Button>
        </header>
        <div className="grid grid-cols-1 gap-4">
          {highRisk.map((machine: any) => (
            <Card key={machine.id} className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all bg-white">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600 shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{machine.name}</h3>
                    <p className="text-xs text-slate-400 font-mono uppercase">{machine.serialNumber}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-8 text-center sm:text-right md:text-center">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Failures</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-end md:justify-center">
                      <Activity size={14} className="text-blue-500" />
                      <span className="text-xl font-bold text-slate-800">{machine.totalRequests}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Downtime</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-end md:justify-center">
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