"use client"

import type React from "react"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PreventiveEvent {
  id: string
  date: Date
  title: string
  equipment: string
  technician: string
}

const INITIAL_EVENTS: PreventiveEvent[] = [
  {
    id: "1",
    date: new Date(2025, 11, 15),
    title: "Quarterly HVAC Service",
    equipment: "HVAC Unit Main",
    technician: "Sarah Lee",
  },
  {
    id: "2",
    date: new Date(2025, 11, 20),
    title: "Conveyor Belt Lube",
    equipment: "Conveyor C-04",
    technician: "Alex Smith",
  },
  {
    id: "3",
    date: new Date(2025, 11, 28),
    title: "Generator Load Test",
    equipment: "GenSet B-1",
    technician: "John Doe",
  },
]

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<PreventiveEvent[]>(INITIAL_EVENTS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const selectedDayEvents = events.filter((event) => date && event.date.toDateString() === date.toDateString())

  const handleDateClick = (clickedDate: Date) => {
    setSelectedDate(clickedDate)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preventive Maintenance Calendar</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Plan and track scheduled maintenance tasks to ensure asset longevity.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <Card className="border-none shadow-sm h-fit">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full"
              // Custom day rendering logic for event indicators
              components={{
                DayButton: (props) => {
                  const hasEvent = events.some((e) => e.date.toDateString() === props.day.date.toDateString())
                  return (
                    <div className="relative w-full">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-full h-12 flex flex-col items-center justify-center p-0 hover:bg-muted relative ${
                          date?.toDateString() === props.day.date.toDateString()
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        }`}
                        onClick={() => setDate(props.day.date)}
                        onDoubleClick={() => handleDateClick(props.day.date)}
                      >
                        <span className="text-sm font-medium">{props.day.date.getDate()}</span>
                        {hasEvent && (
                          <div
                            className={`h-1 w-1 rounded-full mt-1 ${
                              date?.toDateString() === props.day.date.toDateString()
                                ? "bg-primary-foreground"
                                : "bg-primary"
                            }`}
                          />
                        )}
                      </Button>
                    </div>
                  )
                },
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Scheduled Maintenance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                <span>Double-click any date to schedule</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Events for{" "}
                {date ? date.toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative flex flex-col gap-1 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{event.title}</span>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                          Preventive
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{event.equipment}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {event.technician[0]}
                        </div>
                        <span className="text-xs">{event.technician}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No tasks scheduled</p>
                    <Button variant="link" size="sm" className="mt-1" onClick={() => date && handleDateClick(date)}>
                      Schedule now
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full gap-2 shadow-sm" onClick={() => date && handleDateClick(date)}>
            <Plus className="h-4 w-4" /> Schedule New Task
          </Button>
        </div>
      </div>

      <ScheduleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        date={selectedDate}
        onAdd={(e) => setEvents([...events, e])}
      />
    </div>
  )
}

function ScheduleModal({
  open,
  onOpenChange,
  date,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  onAdd: (event: PreventiveEvent) => void
}) {
  const [title, setTitle] = useState("")
  const [equipment, setEquipment] = useState("")
  const [tech, setTech] = useState("Alex Smith")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      date,
      title,
      equipment,
      technician: tech,
    })
    setTitle("")
    setEquipment("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule Preventive Maintenance</DialogTitle>
            <DialogDescription>
              Create a recurring or one-time maintenance task for {date?.toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="e.g. Filter Replacement"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset">Asset / Equipment</Label>
              <Input
                id="asset"
                placeholder="e.g. HVAC Unit A1"
                required
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech-cal">Assigned Technician</Label>
              <Select value={tech} onValueChange={setTech}>
                <SelectTrigger id="tech-cal">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alex Smith">Alex Smith</SelectItem>
                  <SelectItem value="Sarah Lee">Sarah Lee</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add to Calendar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
