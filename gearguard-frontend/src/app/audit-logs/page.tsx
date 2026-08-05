"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Clock, User, Download, Search, Filter } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetch(`${API_BASE}/audit-logs`).then(res => res.json())
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "Create User":
      case "Create Category":
      case "Create Location":
      case "System Seeded":
        return "bg-green-50 text-green-700 border-green-200";
      case "Delete User":
      case "Delete Category":
      case "Delete Location":
      case "Database Cleaned":
      case "Reject Request":
        return "bg-red-50 text-red-700 border-red-200";
      case "Update User":
      case "Approve Request":
      case "Allocate Asset":
      case "Return Asset":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Safety Audit":
        return "bg-purple-50 text-purple-700 border-purple-200 animate-pulse";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Get unique actions dynamically for dropdown
  const uniqueActions = Array.from(new Set(logs.map((log: any) => log.action)));

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = 
      (log.details || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user?.id || log.user?._id || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return alert("No ledger logs to export!");

    const headers = ["Timestamp", "Operator Name", "Operator ID", "Action", "Transaction Details"];
    const rows = filteredLogs.map((log: any) => [
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      log.user?.name || "System Seeder",
      log.user?.id || log.user?._id || "N/A",
      log.action,
      log.details || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gearguard_audit_ledger_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-10 text-center font-medium">Syncing System Audit Logs...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText size={28} className="text-blue-600" /> Audit Ledger
          </h1>
          <p className="text-sm text-slate-500">Immutable chronology of system operations and administrative transactions.</p>
        </div>
        <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 font-bold py-5 shrink-0 self-start md:self-auto">
          <Download size={16} /> Export Ledger (CSV)
        </Button>
      </header>

      {/* FILTER BAR PANEL */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by operator name, ID, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-slate-50/50"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white min-w-[180px] focus:outline-hidden"
          >
            <option value="ALL">All Actions</option>
            {uniqueActions.map((action: any) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border border-slate-200 bg-white overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b">
                <tr>
                  <th className="p-4 w-[200px]">Timestamp</th>
                  <th className="p-4 w-[220px]">Operator</th>
                  <th className="p-4 w-[160px]">Action</th>
                  <th className="p-4">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <User size={12} className="text-slate-400" />
                            {log.user?.name || "System Seeder"}
                          </span>
                          {log.user && (
                            <span className="text-[10px] text-slate-400 font-mono pl-[18px]">
                              ID: {log.user.id || log.user._id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={`text-[10px] font-bold tracking-tight px-2 py-0.5 border uppercase ${getActionColor(log.action)}`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {log.details || "No transaction details supplied."}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 italic">No matching transaction records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
