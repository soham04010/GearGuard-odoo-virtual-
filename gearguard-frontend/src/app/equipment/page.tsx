"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Search, Filter, MoreVertical, MapPin, Users, History, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Equipment {
  id: string
  name: string
  department: string
  location: string
  team: string
  requestCount: number
  status: "Operational" | "Maintenance" | "Critical"
  lastService: string
}

const EQUIPMENT_DATA: Equipment[] = [
  {
    id: "EQ-001",
    name: "Conveyor System C-04",
    department: "Production",
    location: "Main Floor - Bay 2",
    team: "Mechanical Alpha",
    requestCount: 3,
    status: "Maintenance",
    lastService: "2025-10-12",
  },
  {
    id: "EQ-002",
    name: "HVAC Main Unit",
    department: "Facilities",
    location: "Rooftop - Section A",
    team: "HVAC Specialists",
    requestCount: 0,
    status: "Operational",
    lastService: "2025-11-01",
  },
  {
    id: "EQ-003",
    name: "Forklift #42",
    department: "Logistics",
    location: "Warehouse - Dock 4",
    team: "Vehicle Maintenance",
    requestCount: 5,
    status: "Critical",
    lastService: "2025-08-15",
  },
  {
    id: "EQ-004",
    name: "CNC Router R-01",
    department: "Fabrication",
    location: "Shop Floor - Zone 1",
    team: "Mechanical Alpha",
    requestCount: 1,
    status: "Operational",
    lastService: "2025-11-10",
  },
  {
    id: "EQ-005",
    name: "Hydraulic Press P-02",
    department: "Production",
    location: "Main Floor - Bay 5",
    team: "Heavy Equipment",
    requestCount: 2,
    status: "Maintenance",
    lastService: "2025-09-20",
  },
]

export default function EquipmentPage() {
  const [search, setSearch] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredEquipment = EQUIPMENT_DATA.filter(
    (eq) =>
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.department.toLowerCase().includes(search.toLowerCase()),
  )

  const handleShowRequests = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment Inventory</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your assets, locations, and maintenance history.</p>
        </div>
        <Button className="shadow-sm">Add New Asset</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment or department..."
            className="pl-9 bg-background border-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-background border-none shadow-sm">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEquipment.map((eq) => (
          <Card key={eq.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">{eq.name}</CardTitle>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{eq.id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Edit Details</DropdownMenuItem>
                  <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Decommission</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 border-0",
                      eq.status === "Operational" && "bg-success/15 text-success",
                      eq.status === "Maintenance" && "bg-primary/15 text-primary",
                      eq.status === "Critical" && "bg-destructive/15 text-destructive",
                    )}
                  >
                    {eq.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-muted/50 border-0">
                    {eq.department}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{eq.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>{eq.team}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5" />
                    <span>Last Service: {eq.lastService}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 justify-between bg-primary/5 hover:bg-primary/10 text-primary border-0 shadow-none"
                  onClick={() => handleShowRequests(eq)}
                >
                  <span className="font-semibold">Maintenance Requests</span>
                  <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] px-1.5 rounded-full">
                    {eq.requestCount}
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Maintenance Requests: {selectedEquipment?.name}</DialogTitle>
            <DialogDescription>Viewing all active and historical requests for this asset.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEquipment && selectedEquipment.requestCount > 0 ? (
              <div className="space-y-3">
                <div className="rounded-lg border p-4 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">Unusual Noise Detected</p>
                      <Badge variant="secondary" className="text-[10px]">
                        In Progress
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Reported by: Production Team</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Technician Alex Smith is currently investigating potential bearing failure in the primary drive
                      shaft.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border p-4 flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <History className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">Scheduled Calibration</p>
                      <Badge variant="secondary" className="text-[10px]">
                        Upcoming
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Plan ID: PREV-992</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Next routine maintenance scheduled for next Monday to ensure precision standards are met.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
                <History className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="font-medium text-muted-foreground">No maintenance history available</p>
                <p className="text-sm text-muted-foreground">This asset is currently in optimal condition.</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button>Create New Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
