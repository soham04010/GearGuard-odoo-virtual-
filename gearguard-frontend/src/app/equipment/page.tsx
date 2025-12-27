"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, User, Wrench, Search, Box, Building2, Warehouse } from "lucide-react";
import Link from "next/link";

export default function EquipmentPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/equipment`);
      return res.json();
    },
  });

  const createAsset = useMutation({
    mutationFn: async (newAsset: any) => {
      const res = await fetch(`${API_BASE}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsset),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setIsModalOpen(false);
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAsset.mutate(Object.fromEntries(formData.entries()));
  };

  const filteredAssets = assets.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="p-10 text-center font-medium">Syncing Inventory...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Equipment Inventory</h1>
          <p className="text-sm text-slate-500">Manage assets and maintenance history dynamically.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search Name or Serial..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus size={18} /> Add New Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Register New Asset</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4 pt-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Asset Name</label>
                  <Input name="name" placeholder="e.g. Samsung Monitor 15\" required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Serial Number</label>
                  <Input name="serialNumber" placeholder="Unique ID (e.g. SN-9921)" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Category</label>
                  <Input name="category" placeholder="Monitors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Department</label>
                  <Input name="department" placeholder="Admin" />
                </div>
                {/* Added Location and Work Center to match your mockup requirements */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Location / Address</label>
                  <Input name="location" placeholder="Floor 1, Workshop" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Work Center</label>
                  <Input name="workCenter" placeholder="Assembly Line A" />
                </div>
                <div className="col-span-2 space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assigned Employee</label>
                  <Input name="assignedEmployee" placeholder="Technician Name" />
                </div>
                <Button type="submit" className="col-span-2 mt-2 bg-blue-600 font-bold uppercase tracking-widest py-6" disabled={createAsset.isPending}>
                  {createAsset.isPending ? "Saving..." : "Save Asset"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map((item: any) => (
          <Card key={item.id} className="hover:shadow-xl transition-all border-slate-200 bg-white overflow-hidden text-left">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-blue-700">{item.name}</CardTitle>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{item.serialNumber}</p>
              </div>
              <Badge className={item.isUsable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 uppercase"}>
                {item.isUsable ? "Operational" : "Scrapped"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Box size={10} /> Category</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{item.category || 'General'}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Building2 size={10} /> Dept.</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{item.department || 'Unassigned'}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <MapPin size={14} className="text-blue-500" /> 
                  <span className="truncate">{item.location || 'Not Specified'}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Warehouse size={14} className="text-orange-500" /> 
                  <span className="truncate">{item.workCenter || 'No Work Center'}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <User size={14} className="text-slate-400" /> 
                  <span className="truncate">{item.assignedEmployee || 'Unassigned'}</span>
                </div>
              </div>
              <Link href={`/equipment/${item.id}`} className="block pt-2">
                <Button variant="outline" className="w-full justify-between hover:bg-blue-50 group border-slate-200">
                  <span className="flex items-center gap-2 font-bold text-slate-700 uppercase text-xs tracking-tighter">
                    <Wrench size={14} className="text-blue-600" /> Maintenance
                  </span>
                  <Badge className="bg-blue-600 text-white h-6 min-w-[24px] flex items-center justify-center rounded-full font-bold">
                    {item.requestCount || 0}
                  </Badge>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}