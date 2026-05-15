const EVOLUTION_BASE_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE

function formatBrazilianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13) return digits
  if (digits.length === 12) return digits
  if (digits.length === 11) return `55${digits}`
  if (digits.length === 10) return `55${digits}`
  return digits
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  const formatted = formatBrazilianPhone(phone)
  const response = await fetch(`${EVOLUTION_BASE_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY!,
    },
    body: JSON.stringify({ number: formatted, text: message }),
  })
  return response.json()
}

export async function getQRCode() {
  const response = await fetch(`${EVOLUTION_BASE_URL}/instance/qrcode/${EVOLUTION_INSTANCE}`, {
    headers: { 'apikey': EVOLUTION_API_KEY! },
  })
  return response.json()
}

export async function getConnectionStatus() {
  const response = await fetch(`${EVOLUTION_BASE_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
    headers: { 'apikey': EVOLUTION_API_KEY! },
  })
  return response.json()
}
