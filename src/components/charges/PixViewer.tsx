"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatCurrency } from '@/utils/formatters'

interface PixViewerProps {
  pixPayload: string
  amount: number
}

export function PixViewer({ pixPayload, amount }: PixViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload)
    setCopied(true)
    toast.success('PIX copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento PIX — {formatCurrency(amount)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-mono break-all">{pixPayload}</p>
        </div>
        <Button onClick={handleCopy} className="w-full">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? 'Copiado!' : 'Copiar código PIX'}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Abra o app do seu banco, escolha PIX e cole o código acima
        </p>
      </CardContent>
    </Card>
  )
}
