"use client";
import { useQuery } from '@tanstack/react-query';
import { format, isPast } from 'date-fns';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KanbanPage() {
  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => fetch('http://localhost:3001/api/requests').then(res => res.json())
  });

  return (
    <div className="flex gap-4 p-10">
      {['New', 'In Progress', 'Repaired'].map(status => (
        <div key={status} className="w-64 bg-slate-100 p-4 rounded-lg">
          <h2 className="font-bold mb-4">{status}</h2>
          {requests?.filter((r: any) => r.status === status).map((req: any) => (
            <Card key={req.id} className="mb-2">
              <CardHeader className="p-3">
                <CardTitle className="text-sm">{req.subject}</CardTitle>
                {/* Overdue logic using date-fns */}
                {req.scheduledDate && isPast(new Date(req.scheduledDate)) && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}