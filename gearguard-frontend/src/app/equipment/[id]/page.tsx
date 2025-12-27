"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, ArrowLeft, Building2, MapPin, Box, User, Warehouse, History } from "lucide-react"; // Added History
import { format } from "date-fns"; // Make sure to install date-fns
import Link from "next/link";

export default function EquipmentDetail() {
  const { id } = useParams();

  const { data: asset, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => fetch(`${API_BASE}/equipment/${id}`).then(res => res.json())
  });

  if (isLoading) return <div className="p-20 text-center font-bold text-slate-400 text-xl tracking-tighter italic">Loading Asset Metadata...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-white min-h-screen shadow-sm text-left">
      <Link href="/equipment" className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 mb-4 transition-all font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Back to Inventory
      </Link>

      <div className="flex justify-between items-center border-b pb-10">
        <div className="space-y-3 text-left">
          <Badge className={asset?.isUsable ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
            {asset?.isUsable ? "OPERATIONAL" : "SCRAPPED"}
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{asset?.name}</h1>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] font-bold">{asset?.serialNumber}</p>
        </div>
        
        <Link href="/kanban">
          <Button variant="outline" className="h-24 px-8 gap-6 border-2 hover:bg-slate-50 hover:border-blue-500 transition-all shadow-md group">
            <Wrench className="text-blue-600 h-8 w-8 group-hover:rotate-45 transition-transform" />
            <div className="text-left border-l pl-6">
              <p className="text-3xl font-black leading-none text-slate-800">{asset?.requestCount || 0}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-1">Active Requests</p>
            </div>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-20 mt-12">
        <div className="space-y-10">
          <DetailGroup label="Equipment Category" value={asset?.category} icon={<Box size={16}/>} />
          <DetailGroup label="Department" value={asset?.department || "General Operations"} icon={<Building2 size={16}/>} />
          <DetailGroup label="Maintenance Team" value={asset?.team?.name || "Internal Maintenance"} icon={<Wrench size={16}/>} />
        </div>
        <div className="space-y-10">
          <DetailGroup label="Assigned Employee" value={asset?.assignedEmployee} icon={<User size={16}/>} />
          <DetailGroup label="Physical Location" value={asset?.location} icon={<MapPin size={16}/>} />
          <DetailGroup label="Work Center" value={asset?.workCenter || "Primary Assembly Line"} icon={<Warehouse size={16}/>} />
        </div>
      </div>

      {/* NEW: MAINTENANCE HISTORY TABLE SECTION */}
      <div className="mt-16 pt-10 border-t space-y-6">
        <div className="flex items-center gap-2">
          <History className="text-slate-400" size={20} />
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Maintenance History</h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Downtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {asset?.requests && asset.requests.length > 0 ? (
                asset.requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-500">
                      {format(new Date(req.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4 font-bold text-slate-800">{req.subject}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">{req.type}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-[10px] uppercase font-black ${
                        req.status === 'Repaired' ? 'bg-green-100 text-green-700' : 
                        req.status === 'Scrap' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-600">{req.duration || 0}h</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 italic">No maintenance history recorded for this asset.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 pt-10 border-t">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Internal Notes</h3>
        <p className="text-slate-600 bg-slate-50 p-6 rounded-xl italic text-sm">
          {asset?.description || "No specific instructions or history notes provided for this asset."}
        </p>
      </div>
    </div>
  );
}

function DetailGroup({ label, value, icon }: { label: string; value: string, icon: any }) {
  return (
    <div className="border-b border-slate-50 pb-4 flex items-start gap-4">
      <div className="mt-1 text-slate-300">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-700 tracking-tight">{value || "---"}</p>
      </div>
    </div>
  );
}