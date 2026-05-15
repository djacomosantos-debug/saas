"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatDate, getReminderTypeLabel } from "@/utils/formatters"
import { toast } from "sonner"
import { Send, RefreshCw } from "lucide-react"
import type { Reminder } from "@/types"

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  async function loadReminders() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("reminders")
      .select("*, customer:customers(*), vehicle:vehicles(*)")
      .order("scheduled_for", { ascending: true })
    if (data) setReminders(data as unknown as Reminder[])
    setLoading(false)
  }

  useEffect(() => { loadReminders() }, [])

  async function handleSendNow(reminder: Reminder) {
    const supabase = createClient()
    const { error } = await supabase
      .from("reminders")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", reminder.id)
    if (error) {
      toast.error("Erro ao enviar lembrete")
    } else {
      toast.success("Lembrete enviado!")
      loadReminders()
    }
  }

  async function handleSendAll() {
    const supabase = createClient()
    const pending = reminders.filter((r) => r.status === "scheduled")
    for (const reminder of pending) {
      await supabase
        .from("reminders")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", reminder.id)
    }
    toast.success(`${pending.length} lembretes enviados!`)
    loadReminders()
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      oil_change: "bg-yellow-500",
      revision: "bg-blue-500",
      belt: "bg-red-500",
      brakes: "bg-orange-500",
      suspension: "bg-purple-500",
      ac: "bg-cyan-500",
    }
    return colors[type] || "bg-gray-500"
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lembretes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadReminders}>
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
          <Button onClick={handleSendAll}>
            <Send className="h-4 w-4 mr-2" /> Enviar Pendentes
          </Button>
        </div>
      </div>

      {/* Mini calendar - list view */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))
        ) : reminders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum lembrete encontrado
          </div>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getTypeColor(reminder.reminder_type)}`} />
                    <div>
                      <p className="font-medium">{getReminderTypeLabel(reminder.reminder_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.customer?.name || "—"} — {reminder.vehicle?.plate || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reminder.scheduled_for ? formatDate(reminder.scheduled_for) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={reminder.status} />
                    {reminder.status === "scheduled" && (
                      <Button variant="ghost" size="icon" onClick={() => handleSendNow(reminder)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
