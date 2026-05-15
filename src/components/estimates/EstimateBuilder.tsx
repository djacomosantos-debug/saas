"use client"

import { useState } from "react"
import { useFieldArray, useForm, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUp, ArrowDown, Trash2, Plus, Send } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import type { Estimate } from "@/types"

const itemSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  quantity: z.string().transform((v) => parseInt(v) || 1),
  unit_price: z.string().transform((v) => parseFloat(v) || 0),
  type: z.enum(["part", "service"]),
})

const formSchema = z.object({
  items: z.array(z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    quantity: z.number().min(1, "Mínimo 1"),
    unit_price: z.number().min(0, "Preço inválido"),
    type: z.enum(["part", "service"]),
  })).min(1, "Adicione pelo menos um item"),
})

type FormValues = z.infer<typeof formSchema>

interface EstimateBuilderProps {
  estimate?: Estimate
  onSubmit: (values: FormValues) => Promise<void>
  onSend?: () => Promise<void>
  sending?: boolean
}

export function EstimateBuilder({ estimate, onSubmit, onSend, sending }: EstimateBuilderProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: estimate?.items?.length
        ? estimate.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
            type: i.type as "part" | "service",
          }))
        : [{ description: "", quantity: 1, unit_price: 0, type: "part" as const }],
    },
  })

  const { fields, append, remove, swap } = useFieldArray({ control: form.control as unknown as Control<FormValues>, name: "items" })
  const items = form.watch("items")

  const total = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  )

  const previewMessage = items
    .filter((i) => i.description)
    .map(
      (i) =>
        `• ${i.description} (${i.type === "part" ? "Peça" : "Serviço"}) — ${formatCurrency(
          (Number(i.quantity) || 0) * (Number(i.unit_price) || 0)
        )}`
    )
    .join("\n")

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{estimate ? "Editar Orçamento" : "Novo Orçamento"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => swap(index, index - 1)}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === fields.length - 1} onClick={() => swap(index, index + 1)}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.description` as any}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormControl><Input placeholder="Descrição do item..." {...f} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.type` as any}
                        render={({ field: f }) => (
                          <FormItem>
                            <Select value={f.value} onValueChange={f.onChange}>
                              <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="part">Peça</SelectItem>
                                <SelectItem value="service">Serviço</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity` as any}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormControl><Input type="number" min={1} placeholder="Qtd" {...f} onChange={(e) => f.onChange(parseInt(e.target.value) || 1)} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price` as any}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" step="0.01" min={0} placeholder="R$" {...f} onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={() => append({ description: "", quantity: 1, unit_price: 0, type: "part" })}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Item
              </Button>
              <div className="flex items-center justify-between border-t pt-4 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Button type="submit" className="w-full">
                {estimate ? "Atualizar Orçamento" : "Criar Orçamento"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
            {previewMessage
              ? `Olá! Segue o orçamento:\n\n${previewMessage}\n\nTotal: ${formatCurrency(total)}`
              : "Adicione itens para visualizar a mensagem..."}
          </div>
          {estimate && onSend && (
            <Button onClick={onSend} disabled={sending} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Enviando..." : "Enviar por WhatsApp"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
