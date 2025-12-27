"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, User, Wrench } from "lucide-react";
import Link from "next/link";

export default function EquipmentPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch data dynamically
  const { data: assets = [], isLoading, isError } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/equipment`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // 2. Mutation to Save Asset to Database
  const createAsset = useMutation({
    mutationFn: async (newAsset: any) => {
      const res = await fetch(`${API_BASE}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsset),
      });
      if (!res.ok) throw new Error("Failed to create asset");
      return res.json();
    },
    onSuccess: () => {
      // Refresh the list and close modal
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setIsModalOpen(false);
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    createAsset.mutate(data);
  };

  if (isLoading) return <div className="p-10 font-medium text-center">Syncing Inventory...</div>;
  if (isError) return <div className="p-10 text-red-500 text-center">Error connecting to database.</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipment Inventory</h1>
          <p className="text-sm text-slate-500">Manage assets and maintenance history.</p>
        </div>

        {/* --- DYNAMIC ADD ASSET MODAL --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-sm">
              <Plus size={18} /> Add New Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Equipment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment Name</label>
                <Input name="name" placeholder="e.g. CNC Router R-01" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Serial Number</label>
                <Input name="serialNumber" placeholder="Unique ID" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input name="category" placeholder="Fabrication" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input name="department" placeholder="Production" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input name="location" placeholder="Floor 1, Bay 4" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Employee</label>
                <Input name="assignedEmployee" placeholder="Technician Name" />
              </div>
              <Button type="submit" className="w-full bg-blue-600" disabled={createAsset.isPending}>
                {createAsset.isPending ? "Saving..." : "Save Asset"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* --- EQUIPMENT LIST GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.length > 0 ? (
          assets.map((item: any) => (
            <Card key={item.id} className="hover:shadow-lg transition-all border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-slate-800">{item.name}</CardTitle>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">{item.serialNumber}</p>
                </div>
                <Badge className={item.isUsable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {item.isUsable ? "Operational" : "Scrapped"}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge variant="outline" className="justify-center bg-blue-50/50 border-blue-100">{item.category}</Badge>
                  <Badge variant="outline" className="justify-center bg-slate-50 border-slate-200">{item.department}</Badge>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {item.location}</div>
                  <div className="flex items-center gap-2"><User size={14} className="text-slate-400" /> {item.assignedEmployee}</div>
                </div>

                <Link href={`/equipment/${item.id}`} className="block">
                  <Button variant="secondary" className="w-full justify-between hover:bg-slate-200">
                    <span className="flex items-center gap-2"><Wrench size={14} /> Maintenance</span>
                    <Badge className="bg-blue-600 text-white border-none h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                      {item.requestCount || 0}
                    </Badge>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-white">
            <p className="text-slate-400">No equipment found in database. Click "Add New Asset" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}