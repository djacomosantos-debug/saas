"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

const defaultTemplates = {
  oilChange: 'Olá {nome}! 🚗\n\nSeu veículo {modelo} ({placa}) está próximo da próxima troca de óleo.\n\nDeseja agendar sua manutenção?',
  revision: 'Olá {nome}! Seu {modelo} ({placa}) está na hora da revisão. Agende já!',
  estimateApproval: 'Seu orçamento no valor de R$ {valor} está pronto! Clique para aprovar: {link}',
  pixCharge: 'Olá! O serviço foi concluído. 💰 Valor: R$ {valor}\n\nPIX para pagamento:\n{pix}\n\nObrigado pela preferência! 🔧',
}

export function TemplateEditor() {
  const [templates, setTemplates] = useState(defaultTemplates)

  const handleSave = () => {
    localStorage.setItem('whatsapp_templates', JSON.stringify(templates))
    toast.success('Templates salvos!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelos de Mensagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(templates).map(([key, value]) => (
          <div key={key}>
            <label className="text-sm font-medium mb-1 block">{key}</label>
            <Textarea value={value} onChange={(e) => setTemplates({ ...templates, [key]: e.target.value })} rows={4} />
          </div>
        ))}
        <Button onClick={handleSave}>Salvar Templates</Button>
      </CardContent>
    </Card>
  )
}
