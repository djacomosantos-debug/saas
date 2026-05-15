export interface Profile {
  id: string
  name: string | null
  workshop_name: string | null
  phone: string | null
  created_at: string | null
}

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string | null
  vehicle_count?: number
}

export interface Vehicle {
  id: string
  user_id: string
  customer_id: string
  plate: string
  brand: string | null
  model: string | null
  year: number | null
  engine: string | null
  fuel: string | null
  current_mileage: number | null
  created_at: string | null
  customer?: Customer
}

export type ServiceOrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export interface ServiceOrder {
  id: string
  user_id: string
  customer_id: string
  vehicle_id: string
  diagnosis: string | null
  services_description: string | null
  parts_description: string | null
  parts_total: number | null
  labor_total: number | null
  total_amount: number | null
  mileage: number | null
  status: ServiceOrderStatus
  next_service_date: string | null
  next_service_mileage: number | null
  charge_on_complete: boolean | null
  created_at: string | null
  completed_at: string | null
  customer?: Customer
  vehicle?: Vehicle
}

export type EstimateStatus = 'pending' | 'approved' | 'rejected'

export interface EstimateItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  type: 'part' | 'service'
}

export interface Estimate {
  id: string
  user_id: string
  customer_id: string
  vehicle_id: string | null
  service_order_id: string | null
  items: EstimateItem[]
  total_amount: number | null
  status: EstimateStatus
  approval_token: string | null
  created_at: string | null
  customer?: Customer
  vehicle?: Vehicle
}

export type ReminderType = 'oil_change' | 'revision' | 'belt' | 'brakes' | 'suspension' | 'ac' | 'service_due' | 'maintenance' | 'follow_up' | 'custom'
export type ReminderStatus = 'scheduled' | 'sent' | 'failed'

export interface Reminder {
  id: string
  user_id: string
  customer_id: string
  vehicle_id: string | null
  service_order_id: string | null
  reminder_type: string
  scheduled_for: string | null
  sent_at: string | null
  status: ReminderStatus
  created_at: string | null
  customer?: Customer
  vehicle?: Vehicle
}

export type ChargeStatus = 'pending' | 'paid' | 'overdue'

export interface Charge {
  id: string
  user_id: string
  customer_id: string
  service_order_id: string | null
  amount: number | null
  due_date: string | null
  status: ChargeStatus
  asaas_charge_id: string | null
  pix_payload: string | null
  paid_at: string | null
  created_at: string | null
  customer?: Customer
}

export interface DashboardStats {
  monthly_revenue: number
  active_customers: number
  total_vehicles: number
  pending_reminders: number
  return_rate: number
  avg_ticket: number
  revenue_variation: number
  customers_variation: number
}
