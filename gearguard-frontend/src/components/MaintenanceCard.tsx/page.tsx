import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function MaintenanceCard({ item }: any) {
  return (
    <Card className="p-3 space-y-2">
      <div className="flex justify-between">
        <p className="font-medium">{item.equipment}</p>
        <Badge variant={item.overdue ? "destructive" : "secondary"}>
          {item.type}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback>{item.technician[0]}</AvatarFallback>
        </Avatar>
        <span className="text-xs">{item.technician}</span>
      </div>
    </Card>
  );
}
