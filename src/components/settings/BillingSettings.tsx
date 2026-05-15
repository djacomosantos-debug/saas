"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function BillingSettings() {
  const [settings, setSettings] = useState({
    asaasApiKey: '',
    evolutionApiUrl: '',
    evolutionApiKey: '',
    workshopName: '',
    workshopPhone: '',
  })

  const handleSave = () => {
    toast.success('Configurações salvas!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Cobrança</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Chave da API Asaas</Label>
          <Input value={settings.asaasApiKey} onChange={(e) => setSettings({ ...settings, asaasApiKey: e.target.value })} type="password" />
        </div>
        <div className="space-y-2">
          <Label>URL da Evolution API</Label>
          <Input value={settings.evolutionApiUrl} onChange={(e) => setSettings({ ...settings, evolutionApiUrl: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Nome da Oficina</Label>
          <Input value={settings.workshopName} onChange={(e) => setSettings({ ...settings, workshopName: e.target.value })} />
        </div>
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </CardContent>
    </Card>
  )
}
