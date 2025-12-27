"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EquipmentDetail() {
  const { id } = useParams();

  const { data: asset, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => fetch(`${API_BASE}/equipment/${id}`).then(res => res.json())
  });

  if (isLoading) return <div className="p-10 font-medium text-center">Loading Asset Details...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/equipment" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Inventory
      </Link>

      {/* Odoo-style Smart Button Header */}
      <div className="flex justify-between items-center border-b pb-6">
        <div className="space-y-2">
          <Badge className={asset?.isUsable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {asset?.isUsable ? "Operational" : "Scrapped"}
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900">{asset?.name}</h1>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{asset?.serialNumber}</p>
        </div>
        
        <Link href="/kanban">
          <Button variant="outline" className="h-16 px-6 gap-4 border-2 hover:bg-slate-50 hover:border-blue-400 transition-all shadow-sm">
            <Wrench className="text-blue-600 h-6 w-6" />
            <div className="text-left">
              <p className="text-xl font-bold leading-none text-slate-800">{asset?.requestCount || 0}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">Maintenance Requests</p>
            </div>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
        <div className="space-y-8">
          <DetailGroup label="Equipment Category" value={asset?.category} />
          <DetailGroup label="Department" value={asset?.department || "General Operations"} />
          <DetailGroup label="Maintenance Team" value={asset?.team?.name || "Internal Maintenance"} />
        </div>
        <div className="space-y-8">
          <DetailGroup label="Assigned Employee" value={asset?.assignedEmployee} />
          <DetailGroup label="Physical Location" value={asset?.location} />
          <DetailGroup label="Work Center" value="Primary Assembly Line" />
        </div>
      </div>
    </div>
  );
}

function DetailGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-medium text-slate-700">{value || "Not Specified"}</p>
    </div>
  );
}