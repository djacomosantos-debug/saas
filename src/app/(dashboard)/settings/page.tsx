"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WhatsAppConnection } from "@/components/settings/WhatsAppConnection"
import { TemplateEditor } from "@/components/settings/TemplateEditor"
import { BillingSettings } from "@/components/settings/BillingSettings"

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="templates">Modelos</TabsTrigger>
          <TabsTrigger value="billing">Cobrança</TabsTrigger>
        </TabsList>
        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppConnection />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TemplateEditor />
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <BillingSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
