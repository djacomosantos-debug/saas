import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/, 'Telefone inválido')

export const plateSchema = z
  .string()
  .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ''))
  .pipe(
    z
      .string()
      .length(7, 'Placa deve ter 7 caracteres')
      .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Placa inválida')
  )

export const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: phoneSchema.optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const vehicleSchema = z.object({
  customer_id: z.string().uuid(),
  plate: plateSchema,
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z
    .number()
    .int()
    .min(1900, 'Ano inválido')
    .max(new Date().getFullYear() + 1)
    .optional(),
  engine: z.string().optional(),
  fuel: z.string().optional(),
  current_mileage: z.number().int().min(0).optional(),
})

export const serviceOrderSchema = z.object({
  customer_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  diagnosis: z.string().optional(),
  services_description: z.string().optional(),
  parts_description: z.string().optional(),
  parts_total: z.number().min(0).optional(),
  labor_total: z.number().min(0).optional(),
  mileage: z.number().int().min(0).optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
  next_service_date: z.string().optional(),
  next_service_mileage: z.number().int().min(0).optional(),
  charge_on_complete: z.boolean().optional(),
})

export const estimateSchema = z.object({
  customer_id: z.string().uuid(),
  vehicle_id: z.string().uuid().optional(),
  service_order_id: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Descrição é obrigatória'),
        quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
        unit_price: z.number().min(0, 'Preço unitário inválido'),
        total: z.number().min(0),
      })
    )
    .min(1, 'Adicione pelo menos um item'),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']).optional(),
})
