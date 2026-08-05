"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, Plus, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function MyRequestsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const { data: myRequests = [], isLoading } = useQuery({
    queryKey: ["my-requests", currentUser?.id],
    queryFn: () => {
      if (!currentUser?.id) return [];
      return fetch(`${API_BASE}/asset-requests/my-requests?employeeId=${currentUser.id}`).then(res => res.json());
    },
    enabled: !!currentUser?.id
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch(`${API_BASE}/categories`).then(res => res.json())
  });

  const submitRequest = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/asset-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, employeeId: currentUser?.id })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-requests", currentUser?.id] });
      setIsModalOpen(false);
    }
  });

  const returnAsset = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/asset-requests/${id}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-requests", currentUser?.id] });
    }
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submitRequest.mutate(Object.fromEntries(formData.entries()));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Approved": return "bg-blue-100 text-blue-700";
      case "Allocated": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "Returned": return "bg-slate-100 text-slate-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (isLoading) return <div className="p-10 text-center font-medium">Loading Asset Requests...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList size={28} className="text-blue-600" /> My Asset Requests
          </h1>
          <p className="text-sm text-slate-500">Request equipment allocations and manage active items.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus size={18} /> Request Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-left">New Equipment Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Requested Asset Description</label>
                <Input name="assetName" placeholder="e.g. MacBook Pro M3 Max" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Category</label>
                <select name="category" className="w-full p-2.5 border border-slate-200 rounded-md text-sm bg-white" required>
                  <option value="">-- Choose Category --</option>
                  {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Reason for Request</label>
                <Input name="reason" placeholder="Need for new assembly software compile tests" required />
              </div>
              <Button type="submit" className="w-full mt-2 bg-blue-600 font-bold uppercase py-6" disabled={submitRequest.isPending}>
                {submitRequest.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="space-y-4 text-left">
        {myRequests.length > 0 ? (
          myRequests.map((req: any) => (
            <Card key={req.id} className="border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800">{req.assetName}</h3>
                    <Badge className={`uppercase text-[9px] px-2 py-0.5 font-bold ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-400">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase">{req.category}</span>
                    <span>Requested: {format(new Date(req.requestDate), "MMM dd, yyyy")}</span>
                    {req.reason && <span className="italic">"Reason: {req.reason}"</span>}
                  </div>
                  {req.allocatedAsset && (
                    <div className="bg-green-50/50 border border-green-100 p-2.5 rounded-lg text-xs text-green-800 flex items-center gap-2 max-w-md">
                      <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                      <span>Allocated Asset: <strong>{req.allocatedAsset.name}</strong> ({req.allocatedAsset.serialNumber})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {req.status === "Allocated" && (
                    <Button 
                      variant="outline" 
                      className="border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold gap-1.5"
                      onClick={() => {
                        if (confirm(`Are you sure you want to return the allocated asset for "${req.assetName}"?`)) {
                          returnAsset.mutate(req.id);
                        }
                      }}
                      disabled={returnAsset.isPending}
                    >
                      <RefreshCw size={14} className={returnAsset.isPending ? "animate-spin" : ""} />
                      Return Asset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 border border-dashed rounded-xl bg-white text-center">
            <ClipboardList className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-400 font-medium italic">You haven't requested any assets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
