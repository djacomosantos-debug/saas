"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, CheckCircle } from "lucide-react"

export default function BillingPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Planos e Faturamento</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Plano Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-bold">R$ 97<small className="text-sm font-normal text-muted-foreground">/mês</small></p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Até 500 clientes</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Lembretes automáticos</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Cobrança via PIX</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Suporte prioritário</li>
            </ul>
            <Button className="w-full">Plano Atual</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum pagamento encontrado.</p>
        </CardContent>
      </Card>
    </div>
  )
}
