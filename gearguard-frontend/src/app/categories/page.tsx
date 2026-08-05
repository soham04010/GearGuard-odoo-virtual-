"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layers, Plus, Trash2, Box } from "lucide-react";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setAdminUser(JSON.parse(stored));
  }, []);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch(`${API_BASE}/categories`).then(res => res.json())
  });

  const createCategory = useMutation({
    mutationFn: async (newCategory: any) => {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCategory, adminUserId: adminUser?.id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
    },
    onError: (err: any) => alert(err.message)
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/categories/${id}?adminUserId=${adminUser?.id}`, {
        method: "DELETE"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCategory.mutate(Object.fromEntries(formData.entries()));
  };

  if (isLoading) return <div className="p-10 text-center font-medium">Syncing Asset Categories...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers size={28} className="text-blue-600" /> Asset Categories
          </h1>
          <p className="text-sm text-slate-500">Group and classify system components dynamically.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus size={18} /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-left">Create Category Classification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Category Name</label>
                <Input name="name" placeholder="e.g. IT Electronics" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Description</label>
                <Input name="description" placeholder="Office computing resources and systems" />
              </div>
              <Button type="submit" className="w-full mt-2 bg-blue-600 font-bold uppercase py-6" disabled={createCategory.isPending}>
                {createCategory.isPending ? "Creating..." : "Save Category"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((item: any) => (
          <Card key={item.id} className="hover:shadow-md transition-all border-slate-200 bg-white overflow-hidden text-left flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                  <Box size={16} className="text-blue-500" /> {item.name}
                </h3>
                <p className="text-xs text-slate-500">{item.description || "No description provided."}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex justify-end border-t border-slate-50 bg-slate-50/50 p-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm(`Delete category "${item.name}"?`)) {
                    deleteCategory.mutate(item.id);
                  }
                }}
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
