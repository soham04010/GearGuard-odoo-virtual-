"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Trash2, Mail, ShieldAlert } from "lucide-react";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setAdminUser(JSON.parse(stored));
  }, []);

  const { data: usersList = [], isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => fetch(`${API_BASE}/users`).then(res => res.json())
  });

  const createUser = useMutation({
    mutationFn: async (newUser: any) => {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUser, adminUserId: adminUser?.id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => alert(err.message)
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/users/${id}?adminUserId=${adminUser?.id}`, {
        method: "DELETE"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    }
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createUser.mutate(Object.fromEntries(formData.entries()));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700";
      case "manager": return "bg-orange-100 text-orange-700";
      case "technician": return "bg-green-100 text-green-700";
      case "auditor": return "bg-purple-100 text-purple-700";
      case "user": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (isLoading) return <div className="p-10 text-center font-medium">Syncing System Operators...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={28} className="text-blue-600" /> User Directory
          </h1>
          <p className="text-sm text-slate-500">Manage user accounts and allocate system permissions.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <UserPlus size={18} /> Register User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-left">Register System Operator</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Full Name</label>
                <Input name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Email Address</label>
                <Input name="email" type="email" placeholder="john@gearguard.com" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Password</label>
                <Input name="password" type="password" placeholder="••••••••" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Access Role</label>
                <select name="role" className="w-full p-2.5 border border-slate-200 rounded-md text-sm bg-white" required>
                  <option value="user">Employee / User</option>
                  <option value="technician">Technician</option>
                  <option value="manager">Manager</option>
                  <option value="auditor">Auditor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-2 bg-blue-600 font-bold uppercase py-6" disabled={createUser.isPending}>
                {createUser.isPending ? "Creating..." : "Save Operator Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersList.map((item: any) => (
          <Card key={item.id} className="hover:shadow-md transition-all border-slate-200 bg-white overflow-hidden text-left flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Mail size={12} />
                  <span>{item.email}</span>
                </div>
                <div className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded w-max mt-1">
                  ID: {item.id || item._id}
                </div>
              </div>
              <Badge className={`uppercase text-[9px] px-2 py-0.5 font-bold ${getRoleBadge(item.role)}`}>
                {item.role === 'user' ? 'Employee' : item.role}
              </Badge>
            </CardHeader>
            <CardContent className="pt-2 flex justify-end border-t border-slate-50 bg-slate-50/50 p-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (item.id === adminUser?.id) return alert("Cannot delete currently logged-in account!");
                  if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                    deleteUser.mutate(item.id);
                  }
                }}
                disabled={item.id === adminUser?.id}
              >
                <Trash2 size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
