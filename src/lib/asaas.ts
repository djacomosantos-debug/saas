const ASAAS_BASE_URL = process.env.ASAAS_API_URL
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

async function asaasRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${ASAAS_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY!,
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Asaas API error: ${response.statusText}`)
  }

  return response.json()
}

export async function createPixCharge(data: {
  customer: string
  value: number
  dueDate: string
  description?: string
}) {
  return asaasRequest('/charges', {
    method: 'POST',
    body: JSON.stringify({
      customer: data.customer,
      value: data.value,
      dueDate: data.dueDate,
      description: data.description,
      billingType: 'PIX',
    }),
  })
}

export async function getCharge(chargeId: string) {
  return asaasRequest(`/charges/${chargeId}`)
}

export async function getPixQrCode(chargeId: string) {
  return asaasRequest(`/charges/${chargeId}/pixQrCode`)
}

export async function createCustomer(data: {
  name: string
  email?: string
  phone?: string
  cpfCnpj?: string
}) {
  return asaasRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
