"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format, isPast } from "date-fns";
import { ArrowRight, Trash2, Plus, UserCircle, Search, Eye, ShieldAlert, Wrench, CalendarDays, Edit3, Clock, LayoutGrid } from "lucide-react";

const STAGES = ["New", "In Progress", "Repaired", "Scrap"];

export default function KanbanPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // States for the edit form
  const [editForm, setEditForm] = useState({
    subject: "",
    equipmentId: "",
    technicianId: "",
    type: "Corrective",
    date: "",
    status: "New",
    duration: 0
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  // 1. Fetch Maintenance Requests with Creator relations (conditional filtering for technicians)
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", currentUser?.id, currentUser?.role],
    queryFn: () => {
      const url = currentUser?.role === "technician"
        ? `${API_BASE}/maintenance/requests?userId=${currentUser.id}&role=technician`
        : `${API_BASE}/maintenance/requests`;
      return fetch(url).then((res) => res.json());
    },
    enabled: !!currentUser,
  });

  // 2. Fetch Equipment and Users for dropdowns
  const { data: assets = [] } = useQuery({
    queryKey: ["equipment"], queryFn: () => fetch(`${API_BASE}/equipment`).then((res) => res.json())
  });
  const { data: dbUsers = [] } = useQuery({
    queryKey: ["users"], queryFn: () => fetch(`${API_BASE}/auth/users`).then((res) => res.json())
  });

  // 3. Status Update, Create and Update Mutations
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

  const updateTaskDetails = useMutation({
    mutationFn: ({ id, updatedData }: any) =>
      fetch(`${API_BASE}/maintenance/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setIsEditModalOpen(false);
      setSelectedTask(null);
    },
    onError: (err: any) => alert(err.message)
  });

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTask.mutate({
      subject: formData.get("subject"),
      equipmentId: formData.get("equipmentId") as string,
      createdBy: formData.get("technicianId"),
      type: formData.get("type"),
      scheduledDate: new Date(formData.get("date") as string).toISOString(),
    });
  };

  const handleCardClick = (task: any) => {
    setSelectedTask(task);
    setEditForm({
      subject: task.subject || "",
      equipmentId: task.equipmentId || "",
      technicianId: task.createdBy || "",
      type: task.type || "Corrective",
      date: task.scheduledDate ? new Date(task.scheduledDate).toISOString().split("T")[0] : "",
      status: task.status || "New",
      duration: task.duration || 0
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    let updatedFields: any = {};
    if (currentUser?.role === "admin" || currentUser?.role === "manager") {
      updatedFields = {
        subject: editForm.subject,
        equipmentId: editForm.equipmentId,
        createdBy: editForm.technicianId,
        type: editForm.type,
        scheduledDate: editForm.date ? new Date(editForm.date).toISOString() : null,
        status: editForm.status,
        duration: Number(editForm.duration)
      };
    } else if (currentUser?.role === "technician") {
      // Technician can modify tasks that are assigned to them (status, duration)
      updatedFields = {
        status: editForm.status,
        duration: Number(editForm.duration)
      };
    }

    updateTaskDetails.mutate({ id: selectedTask.id, updatedData: updatedFields });
  };

  // 4. DYNAMIC FILTER LOGIC
  const filteredRequests = requests.filter((req: any) => {
    const technicianName = req.creator?.name?.toLowerCase() || "unassigned";
    return technicianName.includes(searchQuery.toLowerCase());
  });

  // Filter users lists to only display technicians in dropdown
  const techniciansOnly = dbUsers.filter((u: any) => u.role === "technician");

  if (isLoading) return <div className="p-10 text-center font-medium italic text-slate-500">Syncing with DB...</div>;

  return (
    <div className="p-6 h-screen bg-slate-50/50 flex flex-col">
      {/* Read-Only Auditor View Warning banner */}
      {currentUser?.role === "auditor" && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-850 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs text-left">
          <ShieldAlert size={18} className="text-amber-600 animate-pulse shrink-0" />
          <span><strong>Auditor View:</strong> You have read-only access to inspect all current works. Creation and status modifications are restricted.</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench size={26} className="text-blue-600" /> 
            {currentUser?.role === "technician" ? "My Maintenance Tasks" : "Maintenance Kanban"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {currentUser?.role === "technician" 
              ? "Track and update your assigned work tickets. Click on any card to modify details." 
              : "Manage facility workflows, schedule corrective works, and allocate technicians. Click on any card to edit details."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar Component */}
          {currentUser?.role !== "technician" && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Filter by technician..." 
                className="pl-9 h-10 bg-white border-slate-200 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Managers and Administrators can create tasks */}
          {(currentUser?.role === "admin" || currentUser?.role === "manager") && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md gap-2 h-10 px-4">
                  <Plus size={18} /> New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="text-left max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold tracking-tight text-slate-950">Create Maintenance Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Issue / Subject</label>
                    <Input name="subject" placeholder="What needs to be fixed?" className="rounded-lg h-11 border-slate-200" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Select Asset</label>
                    <select name="equipmentId" className="w-full h-11 p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500" required>
                      <option value="">-- Choose Asset --</option>
                      {assets.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assign Technician</label>
                    <select name="technicianId" className="w-full h-11 p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500" required>
                      <option value="">-- Choose Technician --</option>
                      {techniciansOnly.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Maintenance Type</label>
                      <select name="type" className="w-full h-11 p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                        <option value="Corrective">Corrective</option>
                        <option value="Preventive">Preventive</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Schedule Date</label>
                      <Input name="date" type="date" className="rounded-lg h-11 border-slate-200" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 font-bold uppercase rounded-lg shadow-sm" disabled={createTask.isPending}>
                    {createTask.isPending ? "Registering..." : "Save Request"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
        {STAGES.map((stage) => {
          const stageRequests = filteredRequests.filter((r: any) => r.status === stage);
          return (
            <div key={stage} className="flex-1 min-w-[310px] bg-slate-100/60 rounded-2xl p-4 flex flex-col border border-slate-200/50 shadow-xs">
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="font-bold text-sm uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    stage === 'New' ? 'bg-blue-500' :
                    stage === 'In Progress' ? 'bg-orange-400' :
                    stage === 'Repaired' ? 'bg-green-500' : 'bg-red-400'
                  }`} />
                  {stage}
                </h2>
                <Badge variant="secondary" className="bg-white border text-slate-600 font-bold shadow-xs">
                  {stageRequests.length}
                </Badge>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[calc(100vh-230px)]">
                {stageRequests.map((req: any) => {
                  const overdue = req.scheduledDate && isPast(new Date(req.scheduledDate)) && req.status !== 'Repaired';
                  return (
                    <Card 
                      key={req.id} 
                      onClick={() => handleCardClick(req)}
                      className={`shadow-xs border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white border border-slate-200/60 rounded-xl cursor-pointer hover:border-slate-350 ${
                        overdue ? "border-l-red-500" : "border-l-blue-500"
                      }`}
                    >
                      <CardHeader className="p-3.5 pb-0">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-sm font-bold text-slate-800 line-clamp-2 text-left tracking-tight leading-snug">{req.subject}</CardTitle>
                          <Badge className={`text-[9px] font-extrabold uppercase px-2 py-0.5 whitespace-nowrap rounded ${
                            req.type === 'Corrective' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {req.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3.5 space-y-3">
                        <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium text-left">
                          {req.equipment?.name || `Asset #${req.equipmentId}`}
                        </div>

                        {req.scheduledDate && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <CalendarDays size={13} className="text-slate-400" />
                            <span>Due: {format(new Date(req.scheduledDate), "MMM dd, yyyy")}</span>
                            {overdue && <span className="text-red-500 font-extrabold">(OVERDUE)</span>}
                          </div>
                        )}

                        <div className="flex justify-between items-center border-t border-slate-50 pt-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 border shadow-xs">
                              <AvatarFallback className="text-[9px] bg-blue-100 text-blue-700 uppercase font-extrabold">
                                {req.creator?.name?.substring(0, 2) || <UserCircle size={14}/>}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] font-semibold text-slate-800 leading-tight">{req.creator?.name || "Unassigned"}</span>
                              <span className="text-[8px] text-slate-400 font-mono leading-none">ID: {req.createdBy?.substring(req.createdBy.length - 6) || "N/A"}</span>
                            </div>
                          </div>

                          {/* Hide action transitions for auditors */}
                          {currentUser?.role !== "auditor" && (
                            <div className="flex gap-1 shrink-0">
                              {stage === "New" && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600 hover:bg-blue-50" onClick={() => updateStatus.mutate({ id: req.id, status: "In Progress" })}>
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}
                              {stage === "In Progress" && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50" onClick={() => updateStatus.mutate({ id: req.id, status: "Repaired" })}>
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}
                              {stage !== "Scrap" && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => updateStatus.mutate({ id: req.id, status: "Scrap", equipmentId: req.equipmentId })}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT/MODIFY TASK DIALOG */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="text-left max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
              <Edit3 size={20} className="text-blue-600" />
              {currentUser?.role === "auditor" ? "View Task Details" : "Modify Task Details"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4 pt-2">
            {/* MANAGER & ADMIN WRITABLE CONTROLS */}
            {(currentUser?.role === "admin" || currentUser?.role === "manager") ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Issue / Subject</label>
                  <Input 
                    value={editForm.subject} 
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className="rounded-lg h-11 border-slate-200" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Select Asset</label>
                  <select 
                    value={editForm.equipmentId} 
                    onChange={(e) => setEditForm({ ...editForm, equipmentId: e.target.value })}
                    className="w-full h-11 p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500" 
                    required
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Assign Technician</label>
                  <select 
                    value={editForm.technicianId} 
                    onChange={(e) => setEditForm({ ...editForm, technicianId: e.target.value })}
                    className="w-full h-11 p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500" 
                    required
                  >
                    <option value="">-- Choose Technician --</option>
                    {techniciansOnly.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Maintenance Type</label>
                    <select 
                      value={editForm.type} 
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full h-11 p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Corrective">Corrective</option>
                      <option value="Preventive">Preventive</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Schedule Date</label>
                    <Input 
                      type="date" 
                      value={editForm.date} 
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="rounded-lg h-11 border-slate-200" 
                      required 
                    />
                  </div>
                </div>
              </>
            ) : (
              /* TECHNICIAN & AUDITOR READ-ONLY INFO */
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 mb-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Issue / Subject</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedTask?.subject}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Asset</span>
                    <p className="text-xs font-medium text-slate-700">{selectedTask?.equipment?.name || "Unassigned"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Type</span>
                    <p className="text-xs font-medium text-slate-700">{selectedTask?.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Schedule Date</span>
                    <p className="text-xs font-medium text-slate-700">
                      {selectedTask?.scheduledDate ? format(new Date(selectedTask.scheduledDate), "MMM dd, yyyy") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Technician</span>
                    <p className="text-xs font-medium text-slate-700">{selectedTask?.creator?.name || "Unassigned"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* STATUS AND DURATION CONTROLS */}
            {currentUser?.role !== "auditor" ? (
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1">
                    <LayoutGrid size={13} className="text-slate-400" /> Status
                  </label>
                  <select 
                    value={editForm.status} 
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full h-11 p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" /> Duration (hrs)
                  </label>
                  <Input 
                    type="number" 
                    min={0}
                    step={0.5}
                    value={editForm.duration} 
                    onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })}
                    className="rounded-lg h-11 border-slate-200" 
                    required 
                  />
                </div>
              </div>
            ) : (
              /* AUDITOR ONLY VIEW STATUS/DURATION */
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 pt-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Current Status</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedTask?.status}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Logged Labor Hours</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedTask?.duration || 0} hrs</p>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                {currentUser?.role === "auditor" ? "Close" : "Cancel"}
              </Button>
              {currentUser?.role !== "auditor" && (
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold" 
                  disabled={updateTaskDetails.isPending}
                >
                  {updateTaskDetails.isPending ? "Updating..." : "Save Modifications"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}