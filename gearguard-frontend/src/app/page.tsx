import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight">🔧 GearGuard</h1>
      <p className="text-xl text-muted-foreground max-w-md">
        The ultimate maintenance tracker for your company assets. 
        Connect teams, equipment, and requests seamlessly.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg">Login to GearGuard</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline" size="lg">Create Account</Button>
        </Link>
      </div>
    </div>
  );
}