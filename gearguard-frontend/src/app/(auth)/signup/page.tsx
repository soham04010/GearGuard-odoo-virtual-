"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const mutation = useMutation({
    mutationFn: (data: any) => authRequest("signup", data),
    onSuccess: () => router.push("/login"),
    onError: (err: any) => alert(err.message),
  });

  const validateAndSubmit = () => {
    // 1. Empty Check
    if (!form.name || !form.email || !form.password) {
      return alert("Fields cannot be empty!");
    }
    // 2. Email Pattern Check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      return alert("Invalid email format!");
    }
    // 3. Password Strength & Match
    if (form.password.length < 6) {
      return alert("Password is too short (min 6 characters)!");
    }
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match!");
    }

    mutation.mutate(form);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[450px] p-4 shadow-2xl">
        <CardHeader><CardTitle className="text-center text-2xl">GearGuard Registration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Full Name" onChange={(e) => setForm({...form, name: e.target.value})} />
          <Input type="email" placeholder="email@gmail.com" onChange={(e) => setForm({...form, email: e.target.value})} />
          <Input type="password" placeholder="Password (Min 6 chars)" onChange={(e) => setForm({...form, password: e.target.value})} />
          <Input type="password" placeholder="Confirm Password" onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
          <Button className="w-full bg-blue-600" onClick={validateAndSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Processing..." : "Create Secure Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}