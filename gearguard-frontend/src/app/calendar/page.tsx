"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format } from "date-fns";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Fetch all maintenance requests
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: () => fetch(`${API_BASE}/requests`).then(res => res.json())
  });

  // Filter for Preventive tasks only
  const preventiveTasks = requests.filter((r: any) => r.type === "Preventive");

  // Find tasks for the selected day
  const selectedDayTasks = preventiveTasks.filter((r: any) => 
    r.scheduledDate && format(new Date(r.scheduledDate), "yyyy-MM-dd") === format(date!, "yyyy-MM-dd")
  );

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Preventive Maintenance Calendar</h1>
          <p className="text-slate-500">Plan and track routine asset checkups.</p>
        </header>

        <Card className="p-4 bg-white shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow"
          />
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Tasks for {date ? format(date, "MMMM do") : "Selected Date"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map((task: any) => (
                <div key={task.id} className="p-3 border rounded-lg bg-slate-50 space-y-1">
                  <div className="font-bold text-sm">{task.subject}</div>
                  <div className="text-xs text-slate-500 italic">Equipment ID: #{task.equipmentId}</div>
                  <Badge className="bg-green-100 text-green-700 mt-2">Planned</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm">No preventive tasks scheduled for this day.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}