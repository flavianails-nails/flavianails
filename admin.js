/* Painel da agenda da Flávia */
(function () {
  "use strict";

  var CONFIG = window.CONFIG;
  var $ = function (id) {
    return document.getElementById(id);
  };

  var telaDesligado = $("tela-desligado");
  var telaLogin = $("tela-login");
  var telaAgenda = $("tela-agenda");
  var diaInput = $("dia");
  var slotsBox = $("slots");
  var proximosBox = $("proximos");
  var resumoDia = $("resumo-dia");
  var erroLogin = $("erro-login");
  var btnSair = $("sair");

  var doDia = []; // registros do dia que está na tela

  /* ---------- utilidades ---------- */

  function hojeISO() {
    var d = new Date();
    var pad = function (n) {
      return String(n).padStart(2, "0");
    };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function porExtenso(iso) {
    var p = String(iso).split("-");
    if (p.length !== 3) return iso;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  }

  function curta(iso) {
    var p = String(iso).split("-");
    return p.length === 3 ? p[2] + "/" + p[1] : iso;
  }

  function somaDias(iso, n) {
    var p = String(iso).split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    d.setDate(d.getDate() + n);
    var pad = function (x) {
      return String(x).padStart(2, "0");
    };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function soDigitos(t) {
    return String(t).replace(/\D/g, "");
  }

  function linkWhats(telefone) {
    var d = soDigitos(telefone);
    if (!d) return null;
    if (d.length <= 11) d = "55" + d;
    return "https://wa.me/" + d;
  }

  function mostrar(tela) {
    telaDesligado.hidden = tela !== "desligado";
    telaLogin.hidden = tela !== "login";
    telaAgenda.hidden = tela !== "agenda";
    btnSair.hidden = tela !== "agenda";
  }

  function elemento(tag, classe, texto) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto != null) el.textContent = texto;
    return el;
  }

  function botao(rotulo, aoClicar) {
    var b = elemento("button", "btn-ghost", rotulo);
    b.type = "button";
    b.addEventListener("click", function () {
      b.disabled = true;
      Promise.resolve(aoClicar())
        .catch(function (err) {
          alert("Não deu certo: " + (err.message || err));
        })
        .then(function () {
          b.disabled = false;
        });
    });
    return b;
  }

  /* ---------- agenda do dia ---------- */

  function carregarDia() {
    var dia = diaInput.value || hojeISO();
    slotsBox.innerHTML = "";
    slotsBox.appendChild(elemento("li", "carregando", "Carregando…"));
    resumoDia.textContent = porExtenso(dia);

    return DB.listarPorData(dia)
      .then(function (registros) {
        doDia = registros || [];
        desenharSlots(dia);
      })
      .catch(function (err) {
        if (err.status === 401 || /sess/i.test(err.message)) return exigirLogin();
        slotsBox.innerHTML = "";
        slotsBox.appendChild(elemento("li", "admin-erro", "Erro ao carregar: " + err.message));
      });
  }

  function desenharSlots(dia) {
    slotsBox.innerHTML = "";

    // horários da config + qualquer horário fora da lista que já exista no banco
    var horarios = CONFIG.times.slice();
    doDia.forEach(function (r) {
      if (horarios.indexOf(r.horario) === -1) horarios.push(r.horario);
    });
    horarios.sort();

    var ocupados = 0;

    horarios.forEach(function (hora) {
      var reg = doDia.filter(function (r) {
        return r.horario === hora;
      })[0];
      if (reg) ocupados++;

      var li = elemento(
        "li",
        "slot " +
          (!reg ? "slot-livre" : reg.tipo === "bloqueio" ? "slot-bloqueio" : "slot-agendado"),
      );
      li.appendChild(elemento("span", "slot-hora", hora));

      var corpo = elemento("div", "slot-corpo");

      if (!reg) {
        corpo.appendChild(elemento("div", "slot-nome", "Livre"));
        var acoesLivre = elemento("div", "slot-acoes");
        acoesLivre.appendChild(
          botao("Fechar este horário", function () {
            return DB.bloquear(dia, hora, "").then(carregarDia).then(carregarProximos);
          }),
        );
        corpo.appendChild(acoesLivre);
      } else if (reg.tipo === "bloqueio") {
        corpo.appendChild(elemento("div", "slot-nome", "Horário fechado"));
        if (reg.observacao) corpo.appendChild(elemento("p", "slot-detalhe", reg.observacao));
        var acoesBloq = elemento("div", "slot-acoes");
        acoesBloq.appendChild(
          botao("Reabrir", function () {
            return DB.apagar(reg.id).then(carregarDia).then(carregarProximos);
          }),
        );
        corpo.appendChild(acoesBloq);
      } else {
        var nome = elemento("div", "slot-nome", reg.nome);
        var tag = elemento(
          "span",
          "etiqueta " + (reg.status === "confirmado" ? "etiqueta-confirmado" : "etiqueta-pendente"),
          reg.status === "confirmado" ? "confirmado" : "pendente",
        );
        nome.appendChild(tag);
        corpo.appendChild(nome);

        corpo.appendChild(elemento("p", "slot-detalhe", reg.servico));
        if (reg.telefone) corpo.appendChild(elemento("p", "slot-detalhe", reg.telefone));

        var acomp = reg.acompanhantes || [];
        if (acomp.length) {
          corpo.appendChild(
            elemento(
              "p",
              "slot-detalhe",
              "Acompanhantes: " +
                acomp
                  .map(function (g) {
                    return (g.name || "—") + (g.service ? " (" + g.service + ")" : "");
                  })
                  .join(", "),
            ),
          );
        }

        var acoes = elemento("div", "slot-acoes");
        if (reg.status !== "confirmado") {
          acoes.appendChild(
            botao("Confirmar", function () {
              return DB.confirmar(reg.id).then(carregarDia).then(carregarProximos);
            }),
          );
        }
        var wa = linkWhats(reg.telefone);
        if (wa) {
          var a = elemento("a", "btn-ghost", "WhatsApp da cliente");
          a.href = wa;
          a.target = "_blank";
          a.rel = "noreferrer";
          acoes.appendChild(a);
        }
        acoes.appendChild(
          botao("Cancelar e liberar", function () {
            if (!confirm("Cancelar o agendamento de " + reg.nome + " às " + hora + "?")) {
              return Promise.resolve();
            }
            return DB.apagar(reg.id).then(carregarDia).then(carregarProximos);
          }),
        );
        corpo.appendChild(acoes);
      }

      li.appendChild(corpo);
      slotsBox.appendChild(li);
    });

    resumoDia.textContent =
      porExtenso(dia) + " — " + ocupados + " de " + horarios.length + " horários ocupados";
  }

  /* ---------- próximos agendamentos ---------- */

  function carregarProximos() {
    proximosBox.innerHTML = "";
    proximosBox.appendChild(elemento("li", "carregando", "Carregando…"));
    return DB.listarFuturos()
      .then(function (registros) {
        proximosBox.innerHTML = "";
        var lista = (registros || []).filter(function (r) {
          return r.tipo === "agendamento";
        });
        if (!lista.length) {
          proximosBox.appendChild(elemento("li", "carregando", "Nenhum agendamento por enquanto."));
          return;
        }
        lista.slice(0, 30).forEach(function (r) {
          var li = elemento("li");
          li.appendChild(elemento("span", "quando", curta(r.data) + " · " + r.horario + " "));
          li.appendChild(document.createTextNode(r.nome + " — " + r.servico));
          if (r.status !== "confirmado") {
            li.appendChild(elemento("span", "etiqueta etiqueta-pendente", "pendente"));
          }
          proximosBox.appendChild(li);
        });
      })
      .catch(function (err) {
        proximosBox.innerHTML = "";
        proximosBox.appendChild(elemento("li", "admin-erro", "Erro: " + err.message));
      });
  }

  /* ---------- login ---------- */

  function exigirLogin() {
    DB.sair();
    $("quem").textContent = "";
    mostrar("login");
  }

  function abrirAgenda() {
    mostrar("agenda");
    $("quem").textContent = "conectada";
    if (!diaInput.value) diaInput.value = hojeISO();
    carregarDia();
    carregarProximos();
  }

  $("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    erroLogin.hidden = true;
    var btn = $("btn-entrar");
    btn.classList.add("is-disabled");
    btn.textContent = "Entrando…";
    DB.entrar($("email").value.trim(), $("senha").value)
      .then(function () {
        $("senha").value = "";
        abrirAgenda();
      })
      .catch(function (err) {
        erroLogin.textContent =
          err.status === 400 ? "E-mail ou senha incorretos." : "Erro ao entrar: " + err.message;
        erroLogin.hidden = false;
      })
      .then(function () {
        btn.classList.remove("is-disabled");
        btn.textContent = "Entrar";
      });
  });

  btnSair.addEventListener("click", function () {
    exigirLogin();
  });

  diaInput.addEventListener("change", carregarDia);
  $("dia-anterior").addEventListener("click", function () {
    diaInput.value = somaDias(diaInput.value || hojeISO(), -1);
    carregarDia();
  });
  $("dia-seguinte").addEventListener("click", function () {
    diaInput.value = somaDias(diaInput.value || hojeISO(), 1);
    carregarDia();
  });

  /* ---------- início ---------- */

  if (!window.DB || !DB.ligado) {
    mostrar("desligado");
  } else if (DB.logada()) {
    abrirAgenda();
  } else {
    mostrar("login");
  }
})();
