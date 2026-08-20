/*
 * ============================================================
 *  CONFIGURAÇÃO DO SITE — edite só este arquivo
 * ============================================================
 *  Depois de editar, salve e faça:
 *      git add -A && git commit -m "atualiza dados" && git push
 *  O site online atualiza sozinho em ~1 minuto.
 */

window.CONFIG = {
  // Número do WhatsApp que RECEBE as mensagens.
  // Formato: 55 (Brasil) + DDD + número, só dígitos, sem espaços ou traços.
  whatsapp: "5511910305226",

  // Tabela de preços (aparece no formulário e na seção "Tabela de Preços").
  services: [
    { name: "Mão", price: "R$ 25,00" },
    { name: "Pé", price: "R$ 30,00" },
    { name: "Mão e pé", price: "R$ 50,00" },
    { name: "Plástica dos pés", price: "R$ 35,00" },
    { name: "Plástica dos pés + esmaltação", price: "R$ 50,00" },
    { name: "Mão + pé + plástica dos pés", price: "R$ 75,00" },
  ],

  // ------------------------------------------------------------
  //  Supabase — o banco que guarda a agenda.
  // ------------------------------------------------------------
  //  Enquanto estes dois campos estiverem vazios, o site funciona
  //  normalmente, só que SEM bloquear horários já ocupados e sem
  //  o painel da Flávia.
  //
  //  Onde achar: painel do Supabase > Project Settings > API keys.
  //    url     = "Project URL"
  //    anonKey = a chave "publishable" (sb_publishable_...)
  //              Esta pode ficar pública: com ela o site só consegue
  //              criar um pedido e perguntar quais horários estão
  //              fechados. Ver as políticas em supabase.sql.
  //
  //  NUNCA coloque aqui a chave "secret" (sb_secret_...) nem a
  //  "service_role": elas dão acesso total ao banco, ignoram todas as
  //  regras de segurança, e este arquivo é visível para quem visitar
  //  o site.
  supabase: {
    url: "https://rsmvwdrcrhxkhvyfknxe.supabase.co",
    anonKey: "sb_publishable_3Sq_QN_BgBDv14G_IKZ4BQ_nmdSZhnb",
  },

  // ------------------------------------------------------------
  //  Mensagens prontas do painel
  // ------------------------------------------------------------
  //  Ao tocar num botão de WhatsApp no painel, a conversa da cliente abre
  //  com um destes textos já escrito — a Flávia só aperta enviar.
  //  Peças que são trocadas pelos dados do agendamento:
  //    {nome}  {data}  {hora}  {servico}
  mensagens: {
    recebido:
      "Oi {nome}! Recebi seu pedido para {data} às {hora} 💗 Já confirmo pra você.",
    confirmado:
      "Oi {nome}! Seu horário está confirmado 💗\n{data} às {hora} — {servico}\nAté lá!",
    recusado:
      "Oi {nome}! Infelizmente {data} às {hora} não vai dar 😔 Me diga outro horário que eu encaixo pra você 💗",
  },

  // Por quantos dias à frente a agenda fica aberta.
  // Com 15, a cliente só escolhe entre hoje e os próximos 15 dias — a janela
  // anda sozinha todo dia, sem ninguém precisar mexer.
  diasAbertos: 15,

  // Antecedência mínima, em minutos, para agendar no mesmo dia.
  // Com 10, um horário some da tela quando faltam menos de 10 minutos para ele
  // — ninguém consegue pedir as 14:00 às 13:55.
  antecedenciaMinutos: 10,

  // Horários oferecidos no formulário.
  times: [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ],
};
