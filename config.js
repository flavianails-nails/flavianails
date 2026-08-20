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
  //  Onde achar: painel do Supabase > Project Settings > API.
  //    url     = "Project URL"
  //    anonKey = a chave "anon public"   ← esta pode ficar pública
  //
  //  NUNCA coloque aqui a chave "service_role": ela dá acesso total
  //  ao banco e este arquivo fica visível para qualquer visitante.
  supabase: {
    url: "",
    anonKey: "",
  },

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
