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
import { ArrowRight, Trash2, Plus } from "lucide-react";

const STAGES = ["New", "In Progress", "Repaired", "Scrap"];

export default function KanbanPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch all maintenance requests dynamically
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: () => fetch(`${API_BASE}/maintenance/requests`).then((res) => res.json()),
  });

  // 2. Fetch Equipment for the "New Task" dropdown
  const { data: assets = [] } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => fetch(`${API_BASE}/equipment`).then((res) => res.json()),
  });

  // 3. Mutation to update status (Workflow Logic)
  const updateStatus = useMutation({
    mutationFn: ({ id, status, equipmentId }: any) =>
      fetch(`${API_BASE}/maintenance/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, equipmentId }),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
  });

  // 4. Mutation to create a new task dynamically
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
    const data = {
      subject: formData.get("subject"),
      equipmentId: parseInt(formData.get("equipmentId") as string),
      type: formData.get("type"),
      scheduledDate: new Date(formData.get("date") as string).toISOString(),
    };
    createTask.mutate(data);
  };

  if (isLoading) return <div className="p-10 text-center font-medium">Loading Board...</div>;

  return (
    <div className="p-6 h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Maintenance Kanban</h1>
        
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
                <option value="">Select Equipment</option>
                {assets.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>
                ))}
              </select>
              <select name="type" className="w-full p-2 border rounded-md text-sm bg-white">
                <option value="Corrective">Corrective</option>
                <option value="Preventive">Preventive</option>
              </select>
              <Input name="date" type="date" required />
              <Button type="submit" className="w-full" disabled={createTask.isPending}>
                {createTask.isPending ? "Creating..." : "Save Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex gap-4 overflow-x-auto h-[calc(100%-120px)] pb-4">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-1 min-w-[300px] bg-slate-200/40 rounded-xl p-4 flex flex-col border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-700">{stage}</h2>
              <Badge variant="secondary" className="bg-white">
                {Array.isArray(requests) ? requests.filter((r: any) => r.status === stage).length : 0}
              </Badge>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              {Array.isArray(requests) && requests.filter((r: any) => r.status === stage).map((req: any) => (
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
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 font-bold">MT</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-1">
                        {stage === "New" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600 hover:bg-blue-50" 
                            onClick={() => updateStatus.mutate({ id: req.id, status: "In Progress" })}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {stage === "In Progress" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50" 
                            onClick={() => updateStatus.mutate({ id: req.id, status: "Repaired" })}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {stage !== "Scrap" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" 
                            onClick={() => updateStatus.mutate({ id: req.id, status: "Scrap", equipmentId: req.equipmentId })}>
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