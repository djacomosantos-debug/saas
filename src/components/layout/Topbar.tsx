"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { UserMenu } from "./UserMenu"

interface TopbarProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/customers": "Clientes",
  "/vehicles": "Veículos",
  "/service-orders": "Ordens de Serviço",
  "/estimates": "Orçamentos",
  "/reminders": "Lembretes",
  "/charges": "Cobranças",
  "/settings": "Configurações",
  "/billing": "Planos e Faturamento",
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const title = pageTitles[pathname] || "AutoRecall CRM"

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
