"use client";

import { Card } from "@/components/ui/card";

const STATUSES = ["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"];

const mockData = [
  { id: "1", equipment: "Lathe Machine", status: "NEW", technician: "John" },
  { id: "2", equipment: "Truck A12", status: "IN_PROGRESS", technician: "Sara" },
];

export default function KanbanBoard() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {STATUSES.map((status) => (
        <div key={status} className="bg-muted/50 rounded-lg p-3">
          <h3 className="text-sm font-medium mb-2">{status}</h3>

          <div className="space-y-2">
            {mockData
              .filter((item) => item.status === status)
              .map((item) => (
                <Card key={item.id} className="p-3">
                  <p className="font-medium">{item.equipment}</p>
                  <p className="text-xs text-muted-foreground">
                    Technician: {item.technician}
                  </p>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

