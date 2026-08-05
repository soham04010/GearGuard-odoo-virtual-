"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ClipboardCheck, Check, X, Box, ArrowUpRight, CheckCircle2, UserCircle, HelpCircle } from "lucide-react";
import { format } from "date-fns";

export default function RequestsManagementPage() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedAssetId, setSelectedAssetId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests-management"],
    queryFn: () => fetch(`${API_BASE}/asset-requests`).then(res => res.json())
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => fetch(`${API_BASE}/equipment`).then(res => res.json())
  });

  // Filter assets that are operational and not currently assigned to someone
  const availableAssets = assets.filter((a: any) => a.isUsable && (!a.assignedEmployee || a.assignedEmployee === "Unassigned"));

  const approveRequest = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/asset-requests/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: currentUser?.id })
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests-management"] })
  });

  const rejectRequest = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/asset-requests/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: currentUser?.id })
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests-management"] })
  });

  const allocateAsset = useMutation({
    mutationFn: async ({ requestId, equipmentId }: { requestId: string, equipmentId: string }) => {
      const res = await fetch(`${API_BASE}/asset-requests/${requestId}/allocate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: currentUser?.id, equipmentId })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests-management"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      setIsAllocateModalOpen(false);
      setSelectedAssetId("");
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
      queryClient.invalidateQueries({ queryKey: ["requests-management"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    }
  });

  const handleOpenAllocate = (reqItem: any) => {
    setSelectedRequest(reqItem);
    setIsAllocateModalOpen(true);
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
      <header className="text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardCheck size={28} className="text-blue-600" /> Asset Requests Control
        </h1>
        <p className="text-sm text-slate-500">Approve employee asset requests, allocate inventory equipment, and process returns.</p>
      </header>

      <div className="space-y-4 text-left">
        {requests.length > 0 ? (
          requests.map((req: any) => (
            <Card key={req.id} className="border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800">{req.assetName}</h3>
                    <Badge className={`uppercase text-[9px] px-2 py-0.5 font-bold ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <UserCircle size={14} className="text-slate-400" />
                      Requested by: <strong>{req.employee?.name || "Employee"}</strong>
                      <span className="text-[10px] font-mono bg-slate-100 px-1 py-0.5 rounded ml-1 text-slate-500">
                        ID: {req.employee?.id || req.employee?._id || req.employeeId}
                      </span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase">{req.category}</span>
                    <span>Date: {format(new Date(req.requestDate), "MMM dd, yyyy")}</span>
                    {req.reason && <span className="italic">"Reason: {req.reason}"</span>}
                  </div>
                  {req.allocatedAsset && (
                    <div className="bg-green-50/50 border border-green-100 p-2.5 rounded-lg text-xs text-green-800 flex items-center gap-2 max-w-md">
                      <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                      <span>Allocated Asset: <strong>{req.allocatedAsset.name}</strong> ({req.allocatedAsset.serialNumber})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "Pending" && (
                    <>
                      <Button 
                        onClick={() => approveRequest.mutate(req.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-1 py-1.5 h-9"
                      >
                        <Check size={14} /> Approve
                      </Button>
                      <Button 
                        onClick={() => rejectRequest.mutate(req.id)}
                        variant="outline" 
                        className="border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold gap-1 py-1.5 h-9"
                      >
                        <X size={14} /> Reject
                      </Button>
                    </>
                  )}
                  {req.status === "Approved" && (
                    <Button 
                      onClick={() => handleOpenAllocate(req)}
                      className="bg-green-600 hover:bg-green-700 text-xs font-bold gap-1.5 py-1.5 h-9"
                    >
                      <ArrowUpRight size={14} /> Allocate Asset
                    </Button>
                  )}
                  {req.status === "Allocated" && (
                    <Button 
                      onClick={() => returnAsset.mutate(req.id)}
                      variant="outline" 
                      className="border-slate-200 hover:bg-slate-50 text-xs font-bold gap-1 py-1.5 h-9"
                    >
                      Process Return
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 border border-dashed rounded-xl bg-white text-center">
            <HelpCircle className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-400 font-medium italic">No employee requests currently pending.</p>
          </div>
        )}
      </div>

      {/* ALLOCATION DIALOG */}
      <Dialog open={isAllocateModalOpen} onOpenChange={setIsAllocateModalOpen}>
        <DialogContent className="sm:max-w-[450px] text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Allocate Asset to Request</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-xs text-slate-500">Select an operational, unassigned equipment item from the facility inventory to allocate for <strong>{selectedRequest?.assetName}</strong> requested by <strong>{selectedRequest?.employee?.name}</strong>.</p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Available Equipment</label>
              <select 
                value={selectedAssetId} 
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-md text-sm bg-white"
                required
              >
                <option value="">-- Select Inventory Asset --</option>
                {availableAssets.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.serialNumber}) - {a.location || 'No Location'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllocateModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (!selectedAssetId) return alert("Please select an asset to allocate!");
                allocateAsset.mutate({ requestId: selectedRequest.id, equipmentId: selectedAssetId });
              }}
              disabled={allocateAsset.isPending || !selectedAssetId}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
