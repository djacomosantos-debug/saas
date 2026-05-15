"use client"
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { HelpCircle } from 'lucide-react'

export function HelpCenter() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Central de Ajuda</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-medium">Como cadastrar um cliente?</h3>
            <p className="text-sm text-muted-foreground">Vá em Clientes &gt; Novo Cliente e preencha os dados.</p>
          </div>
          <div>
            <h3 className="font-medium">Como criar uma ordem de serviço?</h3>
            <p className="text-sm text-muted-foreground">Vá em Ordens de Serviço &gt; Nova OS e siga o passo a passo.</p>
          </div>
          <div>
            <h3 className="font-medium">Como enviar orçamento por WhatsApp?</h3>
            <p className="text-sm text-muted-foreground">Crie um orçamento e clique em &quot;Enviar por WhatsApp&quot;.</p>
          </div>
          <div>
            <h3 className="font-medium">Precisa de mais ajuda?</h3>
            <p className="text-sm text-muted-foreground">Entre em contato pelo email suporte@autorecallcrm.com.br</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
