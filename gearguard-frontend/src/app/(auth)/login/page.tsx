"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const mutation = useMutation({
    mutationFn: (data: any) => authRequest("login", data),
    onSuccess: (user) => {
      // Store UUID for session management
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    },
    onError: (error: any) => alert(error.message),
  });

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">GearGuard Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Email" 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <Button 
            className="w-full" 
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Logging in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm">
            Don't have an account? <a href="/signup" className="text-blue-600">Sign Up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}