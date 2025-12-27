"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format, isPast } from "date-fns";
import { ArrowRight, Trash2, Plus, UserCircle, Search } from "lucide-react";

const STAGES = ["New", "In Progress", "Repaired", "Scrap"];

export default function KanbanPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for filtering

  // 1. Fetch Maintenance Requests with Creator relations
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: () => fetch(`${API_BASE}/maintenance/requests`).then((res) => res.json()),
  });

  // 2. Fetch Equipment and Users for dropdowns
  const { data: assets = [] } = useQuery({
    queryKey: ["equipment"], queryFn: () => fetch(`${API_BASE}/equipment`).then((res) => res.json())
  });
  const { data: dbUsers = [] } = useQuery({
    queryKey: ["users"], queryFn: () => fetch(`${API_BASE}/auth/users`).then((res) => res.json())
  });

  // 3. Status Update and Create Mutations
  const updateStatus = useMutation({
    mutationFn: ({ id, status, equipmentId }: any) =>
      fetch(`${API_BASE}/maintenance/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, equipmentId }),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
  });

  const createTask = useMutation({
    mutationFn: (newTask: any) =>
      fetch(`${API_BASE}/maintenance/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setIsModalOpen(false);
    },
  });

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTask.mutate({
      subject: formData.get("subject"),
      equipmentId: parseInt(formData.get("equipmentId") as string),
      createdBy: formData.get("technicianId"),
      type: formData.get("type"),
      scheduledDate: new Date(formData.get("date") as string).toISOString(),
    });
  };

  // 4. DYNAMIC FILTER LOGIC
  // Filters tasks based on technician name matching the search query
  const filteredRequests = requests.filter((req: any) => {
    const technicianName = req.creator?.name?.toLowerCase() || "unassigned";
    return technicianName.includes(searchQuery.toLowerCase());
  });

  if (isLoading) return <div className="p-10 text-center font-medium italic">Syncing with DB...</div>;

  return (
    <div className="p-6 h-screen bg-slate-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Maintenance Kanban</h1>
        
        <div className="flex items-center gap-4">
          {/* Search Bar Component */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Filter by technician..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus size={18} /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Maintenance Request</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                <Input name="subject" placeholder="What needs to be fixed?" required />
                <select name="equipmentId" className="w-full p-2 border rounded-md text-sm bg-white" required>
                  <option value="">-- Choose Asset --</option>
                  {assets.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
                </select>
                <select name="technicianId" className="w-full p-2 border rounded-md text-sm bg-white" required>
                  <option value="">-- Choose Staff Member --</option>
                  {dbUsers.map((user: any) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                   <select name="type" className="w-full p-2 border rounded-md text-sm bg-white">
                    <option value="Corrective">Corrective</option>
                    <option value="Preventive">Preventive</option>
                  </select>
                  <Input name="date" type="date" required />
                </div>
                <Button type="submit" className="w-full bg-blue-600" disabled={createTask.isPending}>
                  {createTask.isPending ? "Registering..." : "Save Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-1 min-w-[300px] bg-slate-200/40 rounded-xl p-4 flex flex-col border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-700">{stage}</h2>
              <Badge variant="secondary" className="bg-white">
                {filteredRequests.filter((r: any) => r.status === stage).length}
              </Badge>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {filteredRequests.filter((r: any) => r.status === stage).map((req: any) => (
                <Card key={req.id} className={`shadow-sm border-l-4 transition-all hover:shadow-md ${
                  req.scheduledDate && isPast(new Date(req.scheduledDate)) && req.status !== 'Repaired' 
                  ? "border-l-red-500" : "border-l-blue-400"
                }`}>
                  <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-bold truncate pr-2">{req.subject}</CardTitle>
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap uppercase">{req.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div className="text-[11px] text-muted-foreground bg-slate-100 p-1 rounded px-2 font-medium">
                       {req.equipment?.name || `Asset #${req.equipmentId}`}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border">
                          <AvatarFallback className="text-[8px] bg-slate-200 uppercase font-bold text-blue-700">
                            {req.creator?.name?.substring(0, 2) || <UserCircle size={12}/>}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-slate-500 font-medium">{req.creator?.name || "Unassigned"}</span>
                      </div>
                      <div className="flex gap-1">
                        {stage === "New" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600" onClick={() => updateStatus.mutate({ id: req.id, status: "In Progress" })}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {stage === "In Progress" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => updateStatus.mutate({ id: req.id, status: "Repaired" })}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {stage !== "Scrap" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => updateStatus.mutate({ id: req.id, status: "Scrap", equipmentId: req.equipmentId })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}