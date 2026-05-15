import { sendWhatsAppMessage } from '@/lib/evolution'

const templates = {
  oilChangeReminder: (nome: string, modelo: string, placa: string) =>
    `Olá ${nome}! 🚗\n\nSeu veículo ${modelo} (${placa}) está próximo da próxima troca de óleo.\n\nDeseja agendar sua manutenção? Responda esta mensagem! 😊`,

  estimateApproval: (valor: string, link: string) =>
    `Seu orçamento no valor de *R$ ${valor}* está pronto!\n\nClique para visualizar e aprovar:\n${link}`,

  pixCharge: (servico: string, valor: string, pix: string) =>
    `Olá! O serviço *${servico}* foi concluído.\n\n💰 Valor: R$ ${valor}\n\nPIX para pagamento:\n\`${pix}\`\n\nObrigado pela preferência! 🔧`,
}

export async function sendReminder(phone: string, nome: string, modelo: string, placa: string) {
  const message = templates.oilChangeReminder(nome, modelo, placa)
  return sendWhatsAppMessage(phone, message)
}

export async function sendEstimate(phone: string, valor: string, link: string) {
  const message = templates.estimateApproval(valor, link)
  return sendWhatsAppMessage(phone, message)
}

export async function sendPixCharge(phone: string, servico: string, valor: string, pix: string) {
  const message = templates.pixCharge(servico, valor, pix)
  return sendWhatsAppMessage(phone, message)
}
