"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, getReminderTypeLabel } from "@/utils/formatters"
import { toast } from "sonner"
import { Send } from "lucide-react"
import type { Reminder } from "@/types"

const typeColors: Record<string, string> = {
  oil_change: "bg-yellow-500",
  revision: "bg-blue-500",
  belt: "bg-red-500",
  brakes: "bg-orange-500",
  suspension: "bg-purple-500",
  ac: "bg-cyan-500",
}

export function ReminderCalendar() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const currentMonth = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("reminders")
        .select("*, customer:customers(*), vehicle:vehicles(*)")
        .eq("status", "scheduled")
        .order("scheduled_for", { ascending: true })
      if (data) setReminders(data as unknown as Reminder[])
      setLoading(false)
    }
    load()
  }, [])

  const getRemindersForDay = (day: number) => {
    const dateStr = new Date(now.getFullYear(), now.getMonth(), day).toISOString().split("T")[0]
    return reminders.filter((r) => r.scheduled_for?.startsWith(dateStr))
  }

  async function handleSendNow(reminder: Reminder) {
    const supabase = createClient()
    const { error } = await supabase
      .from("reminders")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", reminder.id)
    if (error) {
      toast.error("Erro ao enviar")
    } else {
      toast.success("Lembrete enviado!")
      setReminders((prev) => prev.filter((r) => r.id !== reminder.id))
    }
  }

  if (loading) {
    return <Card><CardHeader><CardTitle>Calendário de Lembretes</CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário — {currentMonth}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="font-medium text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayReminders = getRemindersForDay(day)
            return (
              <Popover key={day}>
                <PopoverTrigger asChild>
                  <button className="relative p-2 rounded-md hover:bg-muted text-sm text-left">
                    <span>{day}</span>
                    {dayReminders.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayReminders.slice(0, 3).map((r) => (
                          <div key={r.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[r.reminder_type] || "bg-gray-500"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                </PopoverTrigger>
                {dayReminders.length > 0 && (
                  <PopoverContent className="w-64 space-y-2">
                    <p className="text-sm font-medium">{day} de {currentMonth}</p>
                    {dayReminders.map((r) => (
                      <div key={r.id} className="text-sm space-y-1 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${typeColors[r.reminder_type] || "bg-gray-500"}`} />
                          <span className="font-medium">{getReminderTypeLabel(r.reminder_type)}</span>
                        </div>
                        <p className="text-muted-foreground">{r.customer?.name} — {r.vehicle?.plate}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleSendNow(r)}>
                          <Send className="h-3 w-3 mr-1" /> Enviar agora
                        </Button>
                      </div>
                    ))}
                  </PopoverContent>
                )}
              </Popover>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
