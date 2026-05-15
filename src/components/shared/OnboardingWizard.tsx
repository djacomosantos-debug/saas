"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, ChevronLeft, ChevronRight, SkipForward, Smartphone, User, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STEPS = ['Configurar Oficina', 'Conectar WhatsApp', 'Cadastrar Primeiro Cliente']
const ONBOARDING_KEY = 'autorecall_onboarding_done'

interface OnboardingWizardProps {
  open: boolean
  onComplete: () => void
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [workshopName, setWorkshopName] = useState('')
  const [workshopPhone, setWorkshopPhone] = useState('')
  const [whatsAppStatus, setWhatsAppStatus] = useState<string>('disconnected')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerVehicle, setCustomerVehicle] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (done === 'true') {
      onComplete()
    }
  }, [onComplete])

  async function handleNext() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      await handleComplete()
    }
  }

  async function handleComplete() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      if (workshopName || workshopPhone) {
        await supabase.from('workshops').upsert({
          user_id: user.id,
          name: workshopName,
          phone: workshopPhone,
        })
      }

      if (customerName && customerPhone) {
        await supabase.from('customers').insert({
          user_id: user.id,
          name: customerName,
          phone: customerPhone,
          vehicle: customerVehicle || null,
        })
      }
    }

    localStorage.setItem(ONBOARDING_KEY, 'true')
    setSaving(false)
    onComplete()
  }

  function handleSkip() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true')
      onComplete()
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Bem-vindo ao AutoRecall CRM!</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > i + 1
                    ? 'bg-primary text-primary-foreground'
                    : step === i + 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>

        <div className="min-h-[250px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Configurar Oficina</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workshop-name">Nome da Oficina</Label>
                <Input
                  id="workshop-name"
                  placeholder="Ex: AutoMecânica Silva"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workshop-phone">Telefone</Label>
                <Input
                  id="workshop-phone"
                  placeholder="(11) 99999-9999"
                  value={workshopPhone}
                  onChange={(e) => setWorkshopPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Conectar WhatsApp</h3>
              </div>
              <Card className="p-8 flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg">
                  {whatsAppStatus === 'connected' ? (
                    <Check className="h-12 w-12 text-green-500" />
                  ) : (
                    <Smartphone className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {whatsAppStatus === 'connected'
                    ? 'WhatsApp conectado!'
                    : 'Escaneie o QR code com seu WhatsApp'}
                </p>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Cadastrar Primeiro Cliente</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-name">Nome do Cliente</Label>
                <Input
                  id="customer-name"
                  placeholder="Ex: João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Telefone</Label>
                <Input
                  id="customer-phone"
                  placeholder="(11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-vehicle">Veículo (opcional)</Label>
                <Input
                  id="customer-vehicle"
                  placeholder="Ex: Gol 2015 - ABC-1234"
                  value={customerVehicle}
                  onChange={(e) => setCustomerVehicle(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="ghost" onClick={handleSkip}>
            <SkipForward className="h-4 w-4 mr-1" />
            Pular
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}
            <Button onClick={handleNext} disabled={saving}>
              {step < 3 ? (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Concluir
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
