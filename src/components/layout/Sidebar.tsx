"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wrench, LayoutDashboard, Users, Car, ClipboardList, FileText, Bell, CreditCard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/vehicles", label: "Veículos", icon: Car },
  { href: "/service-orders", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/estimates", label: "Orçamentos", icon: FileText },
  { href: "/reminders", label: "Lembretes", icon: Bell, badge: true },
  { href: "/charges", label: "Cobranças", icon: CreditCard },
  { href: "/settings", label: "Configurações", icon: Settings },
]

const pendingCount = 7

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex h-full flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Wrench className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">AutoRecall CRM</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                className="justify-start gap-3"
                asChild
                onClick={onClose}
              >
                <Link href={item.href} className="flex items-center">
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-primary-foreground">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-green-500" />
          WhatsApp Conectado
        </div>
      </div>
    </aside>
  )
}
