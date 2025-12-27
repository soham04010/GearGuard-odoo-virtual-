"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
        <Link href="/kanban"><Button>Open Kanban Board</Button></Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50">
          <CardHeader><CardTitle>Active Requests</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-blue-600">12</p></CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader><CardTitle>Overdue Items</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-red-600">3</p></CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader><CardTitle>Equipment Health</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-bold text-green-600">98%</p></CardContent>
        </Card>
      </div>
    </div>
  );
}