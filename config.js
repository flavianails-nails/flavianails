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
