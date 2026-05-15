"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EstimateApprovalCard } from '@/components/estimates/EstimateApprovalCard'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import type { Estimate as EstimateType, EstimateItem } from '@/types'

export default function EstimatePublicPage({ params }: { params: Promise<{ token: string }> }) {
  const [estimate, setEstimate] = useState<EstimateType | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [actionDone, setActionDone] = useState<'approved' | 'rejected' | null>(null)
  const [token, setToken] = useState('')

  useEffect(() => {
    async function init() {
      const { token: t } = await params
      setToken(t)
    }
    init()
  }, [params])

  useEffect(() => {
    if (!token) return
    async function fetchEstimate() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('approval_token', token)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setEstimate({
          id: data.id,
          user_id: data.user_id,
          customer_id: data.customer_id,
          vehicle_id: data.vehicle_id,
          service_order_id: data.service_order_id,
          items: (data.items as EstimateItem[]) || [],
          total_amount: data.total_amount,
          status: data.status,
          approval_token: data.approval_token,
          created_at: data.created_at,
        })
      }
      setLoading(false)
    }

    fetchEstimate()
  }, [token])

  async function handleApprove() {
    if (!estimate) return
    const supabase = createClient()
    const { error } = await supabase
      .from('estimates')
      .update({ status: 'approved' })
      .eq('id', estimate.id)
    if (!error) setActionDone('approved')
  }

  async function handleReject() {
    if (!estimate) return
    const supabase = createClient()
    const { error } = await supabase
      .from('estimates')
      .update({ status: 'rejected' })
      .eq('id', estimate.id)
    if (!error) setActionDone('rejected')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <XCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Orçamento não encontrado</h1>
        <p className="text-muted-foreground">O link que você acessou é inválido ou expirou.</p>
      </div>
    )
  }

  if (actionDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        {actionDone === 'approved' ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold">Orçamento Aprovado!</h1>
            <p className="text-muted-foreground">Obrigado pela confirmação. Entraremos em contato em breve.</p>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold">Orçamento Rejeitado</h1>
            <p className="text-muted-foreground">Seu feedback foi registrado. Se precisar de algo diferente, entre em contato conosco.</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">AutoRecall CRM</h1>
          <p className="text-muted-foreground">Orçamento</p>
        </div>
        {estimate && (
          <EstimateApprovalCard
            estimate={estimate}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </div>
  )
}
