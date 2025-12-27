"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay, parseISO } from "date-fns";
import { API_BASE } from "@/lib/api";

// UI Components
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // --- LOGIC: Fetch and Filter ---
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: () => fetch(`${API_BASE}/requests`).then((res) => res.json()),
  });

  const preventiveTasks = Array.isArray(requests) 
    ? requests.filter((r: any) => r.type === "Preventive")
    : [];

  const selectedDayTasks = preventiveTasks.filter((r: any) =>
    r.scheduledDate && isSameDay(parseISO(r.scheduledDate), date || new Date())
  );

  const hasEventOnDate = (day: Date) => {
    return preventiveTasks.some((r: any) => 
      r.scheduledDate && isSameDay(parseISO(r.scheduledDate), day)
    );
  };

  return (
    // "w-full" and "h-screen" (or calc) ensures it fills the whole page
    <div className="flex flex-col w-full min-h-screen p-6 md:p-10 bg-slate-50/30">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Preventive Maintenance</h1>
        <p className="text-slate-500 text-lg">Schedule and track routine asset checkups across the facility.</p>
      </header>

      {/* Grid fills the width; gap is larger for a clean full-page look */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] flex-1">
        
        {/* LEFT: CALENDAR (Centered in a large card) */}
        <Card className="border shadow-sm bg-white flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-lg"> {/* Slightly larger max-width for "medium" on a full page */}
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-none w-full scale-110" // scale-110 makes the calendar feel more present
              components={{
                DayButton: (props) => {
                  const hasEvent = hasEventOnDate(props.day.date);
                  const isSelected = date && isSameDay(date, props.day.date);
                  
                  return (
                    <div className="relative w-full">
                      <Button
                        variant="ghost"
                        className={`w-full h-14 flex flex-col items-center justify-center p-0 hover:bg-slate-100 relative rounded-md transition-all ${
                          isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" : ""
                        }`}
                        onClick={() => setDate(props.day.date)}
                        onDoubleClick={() => setIsModalOpen(true)}
                      >
                        <span className="text-base font-medium">{props.day.date.getDate()}</span>
                        {hasEvent && (
                          <div className={`h-1.5 w-1.5 rounded-full mt-1 ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                        )}
                      </Button>
                    </div>
                  );
                },
              }}
            />
          </div>
          
          <div className="mt-12 flex items-center gap-8 text-sm text-slate-400 border-t pt-6 w-full max-w-md justify-center">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Scheduled Task</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Double-click date to add</span>
            </div>
          </div>
        </Card>

        {/* RIGHT: TASK LIST (Fixed width sidebar) */}
        <div className="flex flex-col gap-6">
          <Card className="border shadow-sm flex-1 bg-white overflow-hidden flex flex-col">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
              <CardTitle className="text-xl font-bold text-slate-800">
                {date ? format(date, "MMMM do, yyyy") : "Daily Tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {selectedDayTasks.length > 0 ? (
                  selectedDayTasks.map((task: any) => (
                    <div key={task.id} className="flex flex-col gap-2 rounded-xl border p-4 bg-white shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-slate-900">{task.subject}</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">Planned</Badge>
                      </div>
                      <div className="flex items-center text-sm text-slate-500 gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono">ID: {task.equipmentId}</span>
                        <span className="italic">Equipment Check</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                       <Plus className="text-slate-300 w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No preventive maintenance<br/>scheduled for today.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full gap-3 py-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-6 w-6" /> Schedule New Task
          </Button>
        </div>
      </div>

      <ScheduleModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        selectedDate={date} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["requests"] })}
      />
    </div>
  );
}

// ... ScheduleModal remains the same as in the previous fixed response ...
function ScheduleModal({ open, onOpenChange, selectedDate, onSuccess }: any) {
  const [title, setTitle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Preventive",
          subject: title,
          equipmentId: equipment,
          scheduledDate: selectedDate.toISOString(),
          status: "Planned",
        }),
      });
      if (response.ok) {
        onSuccess();
        onOpenChange(false);
        setTitle("");
        setEquipment("");
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Maintenance Task</DialogTitle>
            <DialogDescription>Scheduling for {selectedDate ? format(selectedDate, "PPP") : ""}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Subject</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monthly Inspection" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment / Asset ID</Label>
              <Input id="equipment" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g. PUMP-01" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}