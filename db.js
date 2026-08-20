/*
 * Conversa com o Supabase (banco da agenda), via REST — sem bibliotecas.
 * Usado pelo site público (app.js) e pelo painel da Flávia (admin.js).
 *
 * Se o Supabase não estiver configurado em config.js, tudo aqui vira
 * "desligado" e o site continua funcionando do jeito antigo: sem bloquear
 * horários, só montando a mensagem do WhatsApp.
 */
(function () {
  "use strict";

  var CFG = (window.CONFIG && window.CONFIG.supabase) || {};
  var URL_BASE = (CFG.url || "").replace(/\/+$/, "");
  var ANON = CFG.anonKey || "";
  var LIGADO = Boolean(URL_BASE && ANON);

  var TOKEN_KEY = "flavianails.sessao";

  function sessao() {
    try {
      return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function guardarSessao(s) {
    if (s) localStorage.setItem(TOKEN_KEY, JSON.stringify(s));
    else localStorage.removeItem(TOKEN_KEY);
  }

  function headers(comToken) {
    var h = {
      apikey: ANON,
      "Content-Type": "application/json",
      Authorization: "Bearer " + ANON,
    };
    var s = sessao();
    if (comToken && s && s.access_token) {
      h.Authorization = "Bearer " + s.access_token;
    }
    return h;
  }

  function erroDe(resposta, corpo) {
    var msg = "";
    try {
      var j = JSON.parse(corpo);
      msg = j.message || j.error_description || j.msg || j.error || "";
    } catch (e) {
      msg = corpo;
    }
    var err = new Error(msg || "Erro " + resposta.status);
    err.status = resposta.status;
    return err;
  }

  function pedir(caminho, opcoes, comToken) {
    opcoes = opcoes || {};
    opcoes.headers = Object.assign(headers(comToken), opcoes.headers || {});
    return fetch(URL_BASE + caminho, opcoes).then(function (r) {
      return r.text().then(function (texto) {
        if (!r.ok) throw erroDe(r, texto);
        return texto ? JSON.parse(texto) : null;
      });
    });
  }

  /* ---------- site público ---------- */

  function horariosOcupados(dia) {
    if (!LIGADO || !dia) return Promise.resolve([]);
    return pedir("/rest/v1/rpc/horarios_ocupados", {
      method: "POST",
      body: JSON.stringify({ dia: dia }),
    }).then(function (linhas) {
      return (linhas || []).map(function (l) {
        return l.horario;
      });
    });
  }

  function criarAgendamento(dados) {
    if (!LIGADO) return Promise.resolve(null);
    return pedir("/rest/v1/agendamentos", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        data: dados.data,
        horario: dados.horario,
        tipo: "agendamento",
        status: "pendente",
        nome: dados.nome,
        telefone: dados.telefone,
        servico: dados.servico,
        acompanhantes: dados.acompanhantes || [],
      }),
    });
  }

  /* ---------- painel da Flávia ---------- */

  function entrar(email, senha) {
    return fetch(URL_BASE + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: senha }),
    }).then(function (r) {
      return r.text().then(function (texto) {
        if (!r.ok) throw erroDe(r, texto);
        var s = JSON.parse(texto);
        guardarSessao(s);
        return s;
      });
    });
  }

  function sair() {
    guardarSessao(null);
  }

  function logada() {
    var s = sessao();
    return Boolean(s && s.access_token);
  }

  function renovar() {
    var s = sessao();
    if (!s || !s.refresh_token) return Promise.reject(new Error("sem sessão"));
    return fetch(URL_BASE + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: { apikey: ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    }).then(function (r) {
      if (!r.ok) {
        guardarSessao(null);
        throw new Error("sessão expirada");
      }
      return r.json().then(function (nova) {
        guardarSessao(nova);
        return nova;
      });
    });
  }

  // Repete o pedido uma vez se o token tiver expirado.
  function admin(caminho, opcoes) {
    return pedir(caminho, opcoes, true).catch(function (err) {
      if (err.status !== 401) throw err;
      return renovar().then(function () {
        return pedir(caminho, opcoes, true);
      });
    });
  }

  // Estar logada não basta: o cadastro do Supabase é aberto. Isto pergunta
  // ao banco se o e-mail da sessão está na lista de administradoras.
  function souAdmin() {
    return admin("/rest/v1/rpc/eh_admin", {
      method: "POST",
      body: "{}",
    }).then(function (resposta) {
      return resposta === true;
    });
  }

  function listarPorData(dia) {
    return admin(
      "/rest/v1/agendamentos?data=eq." + encodeURIComponent(dia) + "&order=horario.asc",
      { method: "GET" },
    );
  }

  function listarFuturos() {
    // Precisa ser a data do relógio local. Com toISOString() o Brasil (UTC-3)
    // já vira "amanhã" às 21h, e os agendamentos do fim do dia sumiam da lista.
    var d = new Date();
    var pad = function (n) {
      return String(n).padStart(2, "0");
    };
    var hoje = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    return admin(
      "/rest/v1/agendamentos?data=gte." + hoje + "&order=data.asc,horario.asc",
      { method: "GET" },
    );
  }

  function confirmar(id) {
    return admin("/rest/v1/agendamentos?id=eq." + id, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "confirmado" }),
    });
  }

  function apagar(id) {
    return admin("/rest/v1/agendamentos?id=eq." + id, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
  }

  function bloquear(dia, horario, observacao) {
    return admin("/rest/v1/agendamentos", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        data: dia,
        horario: horario,
        tipo: "bloqueio",
        status: "confirmado",
        nome: "Horário fechado",
        observacao: observacao || "",
      }),
    });
  }

  window.DB = {
    ligado: LIGADO,
    horariosOcupados: horariosOcupados,
    criarAgendamento: criarAgendamento,
    entrar: entrar,
    sair: sair,
    logada: logada,
    souAdmin: souAdmin,
    listarPorData: listarPorData,
    listarFuturos: listarFuturos,
    confirmar: confirmar,
    apagar: apagar,
    bloquear: bloquear,
  };
})();
