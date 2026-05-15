"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Smartphone, RefreshCw } from "lucide-react"

export function WhatsAppConnection() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "loading">("loading")
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  async function checkStatus() {
    try {
      const res = await fetch("/api/evolution/status")
      const data = await res.json()
      setStatus(data.connected ? "connected" : "disconnected")
    } catch {
      setStatus("disconnected")
    }
  }

  async function handleConnect() {
    setStatus("loading")
    try {
      const res = await fetch("/api/evolution/qrcode")
      const data = await res.json()
      if (data.qrcode) setQrCode(data.qrcode)
    } catch {
      // ignore
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Conexão WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "connected" ? (
            <Badge className="bg-green-500">Conectado</Badge>
          ) : (
            <Badge variant="outline" className="text-red-500">Desconectado</Badge>
          )}
        </div>

        {qrCode && (
          <div className="bg-white p-4 rounded-lg inline-block">
            <img src={qrCode} alt="QR Code WhatsApp" className="w-48 h-48" />
          </div>
        )}

        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Abra o WhatsApp no seu celular</li>
          <li>2. Toque em Menu ou Configurações</li>
          <li>3. Selecione "WhatsApp Web"</li>
          <li>4. Leia o QR Code acima</li>
        </ol>

        <Button onClick={handleConnect} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Conectar / Reconectar
        </Button>
      </CardContent>
    </Card>
  )
}
