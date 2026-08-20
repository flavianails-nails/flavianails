/* Flávia Nails — lógica do agendamento (JS puro, sem build) */
(function () {
  "use strict";

  var CONFIG = window.CONFIG;
  var guests = [];
  var selectedTime = "";
  var ocupados = []; // horários já tomados na data escolhida
  var enviando = false;
  var mensagemAviso = null; // recado específico (ex.: horário tomado na hora)

  var AVISO_PADRAO = "Preencha nome, WhatsApp, serviço, data e horário para confirmar.";

  var $ = function (id) {
    return document.getElementById(id);
  };

  var nameInput = $("name");
  var phoneInput = $("phone");
  var serviceSelect = $("service");
  var dateInput = $("date");
  var timesBox = $("times");
  var guestsBox = $("guests");
  var submit = $("submit");
  var hint = $("hint");

  /* ---------- helpers ---------- */

  function serviceOptions(select, selected) {
    select.innerHTML = "";
    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "Selecione um serviço";
    select.appendChild(empty);
    CONFIG.services.forEach(function (s) {
      var label = s.name + " — " + s.price;
      var opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      if (label === selected) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function formatDate(value) {
    // value vem como "AAAA-MM-DD" do <input type="date">
    var parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function digits(value) {
    return String(value).replace(/\D/g, "");
  }

  function formatPhone(value) {
    var d = digits(value).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10)
      return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  function isReady() {
    return Boolean(
      nameInput.value.trim() &&
        digits(phoneInput.value).length >= 10 &&
        serviceSelect.value &&
        dateInput.value &&
        dateInput.value >= dateInput.min &&
        dateInput.value <= dateInput.max &&
        selectedTime &&
        ocupados.indexOf(selectedTime) === -1,
    );
  }

  function listaAcompanhantes() {
    return guests.filter(function (g) {
      return g.name || g.service;
    });
  }

  function buildMessage() {
    var lines = [
      "Olá! Quero confirmar meu agendamento na Flávia Nails 💗",
      "Nome: " + nameInput.value.trim(),
      "WhatsApp: " + formatPhone(phoneInput.value),
      "Serviço: " + serviceSelect.value,
      "Data: " + formatDate(dateInput.value),
      "Horário: " + selectedTime,
    ];
    listaAcompanhantes().forEach(function (g, i) {
      lines.push(
        "Acompanhante " + (i + 1) + ": " + (g.name || "—") + " — " + (g.service || "a definir"),
      );
    });
    return lines.join("\n");
  }

  function waLink(text) {
    var url = "https://wa.me/" + digits(CONFIG.whatsapp);
    return text ? url + "?text=" + encodeURIComponent(text) : url;
  }

  function aviso(texto) {
    mensagemAviso = texto;
    hint.textContent = texto;
    hint.style.visibility = "visible";
    hint.classList.remove("shake");
    void hint.offsetWidth; // reinicia a animação
    hint.classList.add("shake");
  }

  /* ---------- render ---------- */

  function renderTimes() {
    timesBox.innerHTML = "";
    CONFIG.times.forEach(function (t) {
      var tomado = ocupados.indexOf(t) !== -1;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "time" + (t === selectedTime && !tomado ? " is-active" : "") + (tomado ? " is-taken" : "");
      btn.textContent = t;
      btn.disabled = tomado;
      btn.title = tomado ? "Horário já reservado" : "";
      btn.setAttribute("aria-pressed", t === selectedTime && !tomado ? "true" : "false");
      btn.addEventListener("click", function () {
        selectedTime = t;
        mensagemAviso = null; // escolheu outro horário: recado antigo sai
        renderTimes();
        update();
      });
      timesBox.appendChild(btn);
    });
  }

  function renderGuests() {
    guestsBox.innerHTML = "";
    guests.forEach(function (g, i) {
      var box = document.createElement("div");
      box.className = "guest";

      var head = document.createElement("div");
      head.className = "guest-head";
      var title = document.createElement("span");
      title.className = "guest-title";
      title.textContent = "Acompanhante " + (i + 1);
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "guest-remove";
      remove.textContent = "remover";
      remove.addEventListener("click", function () {
        guests.splice(i, 1);
        renderGuests();
        update();
      });
      head.appendChild(title);
      head.appendChild(remove);

      var gname = document.createElement("input");
      gname.className = "input";
      gname.type = "text";
      gname.placeholder = "Nome do acompanhante";
      gname.value = g.name;
      gname.addEventListener("input", function () {
        guests[i].name = gname.value;
        update();
      });

      var gservice = document.createElement("select");
      gservice.className = "input";
      serviceOptions(gservice, g.service);
      gservice.addEventListener("change", function () {
        guests[i].service = gservice.value;
        update();
      });

      box.appendChild(head);
      box.appendChild(gname);
      box.appendChild(gservice);
      guestsBox.appendChild(box);
    });
  }

  function renderPrices() {
    var list = $("price-list");
    list.innerHTML = "";
    CONFIG.services.forEach(function (s) {
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.textContent = s.name;
      var price = document.createElement("span");
      price.className = "price";
      price.textContent = s.price;
      li.appendChild(name);
      li.appendChild(price);
      list.appendChild(li);
    });
  }

  function update() {
    var ready = isReady();
    submit.setAttribute("aria-disabled", ready || enviando ? "false" : "true");
    submit.classList.toggle("is-disabled", !ready || enviando);
    submit.href = ready ? waLink(buildMessage()) : "#";
    if (enviando) {
      submit.textContent = "Reservando…";
    } else {
      submit.textContent = "Confirmar agendamento";
    }
    if (ready) {
      hint.style.visibility = "hidden";
    } else {
      hint.textContent = mensagemAviso || AVISO_PADRAO;
      hint.style.visibility = "visible";
    }
  }

  /* ---------- horários ocupados ---------- */

  function carregarOcupados() {
    ocupados = [];
    renderTimes();
    update();
    if (!window.DB || !DB.ligado || !dateInput.value) return;

    timesBox.classList.add("is-loading");
    var pedidoPara = dateInput.value;
    DB.horariosOcupados(pedidoPara)
      .then(function (lista) {
        // ignora resposta de uma data que a cliente já trocou
        if (pedidoPara !== dateInput.value) return;
        ocupados = lista;
        if (ocupados.indexOf(selectedTime) !== -1) selectedTime = "";
        renderTimes();
        update();
      })
      .catch(function (err) {
        // Sem conexão com o banco o site não trava: segue sem bloquear
        // horários, e a Flávia confirma manualmente pelo WhatsApp.
        console.error("Não foi possível ler os horários ocupados:", err);
      })
      .then(function () {
        timesBox.classList.remove("is-loading");
      });
  }

  /* ---------- envio ---------- */

  function irParaWhatsApp() {
    window.location.href = waLink(buildMessage());
  }

  function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    if (!isReady()) {
      aviso(AVISO_PADRAO);
      return;
    }

    // Sem banco configurado: comportamento antigo, vai direto pro WhatsApp.
    if (!window.DB || !DB.ligado) {
      irParaWhatsApp();
      return;
    }

    enviando = true;
    update();

    DB.criarAgendamento({
      data: dateInput.value,
      horario: selectedTime,
      nome: nameInput.value.trim(),
      telefone: formatPhone(phoneInput.value),
      servico: serviceSelect.value,
      acompanhantes: listaAcompanhantes(),
    })
      .then(function () {
        irParaWhatsApp();
      })
      .catch(function (err) {
        enviando = false;
        if (err.status === 409) {
          // A Flávia confirmou outra cliente neste horário nos últimos segundos.
          aviso("Esse horário acabou de ser fechado. Escolha outro, por favor.");
          selectedTime = "";
          carregarOcupados();
          return;
        }
        // Qualquer outro problema (internet, banco fora do ar) não pode
        // impedir a cliente de falar com a Flávia.
        console.error("Falha ao reservar:", err);
        update();
        irParaWhatsApp();
      });
  }

  /* ---------- init ---------- */

  serviceOptions(serviceSelect, "");
  renderTimes();
  renderPrices();

  // A agenda abre só para os próximos dias: nada de passado, nada de daqui a
  // seis meses. A janela anda sozinha — amanhã ela já cobre um dia a mais.
  var pad = function (n) {
    return String(n).padStart(2, "0");
  };
  var paraISO = function (d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  };

  var DIAS_ABERTOS = Number(CONFIG.diasAbertos) > 0 ? Number(CONFIG.diasAbertos) : 15;
  var hoje = new Date();
  var ultimoDia = new Date();
  ultimoDia.setDate(ultimoDia.getDate() + DIAS_ABERTOS);

  dateInput.min = paraISO(hoje);
  dateInput.max = paraISO(ultimoDia);

  var ajuda = $("janela-datas");
  if (ajuda) {
    ajuda.textContent =
      "Agenda aberta até " +
      ultimoDia.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }) +
      " (" +
      DIAS_ABERTOS +
      " dias).";
  }

  // O seletor nativo já bloqueia, mas dá para digitar a data na mão.
  function dataDentroDaJanela() {
    var v = dateInput.value;
    if (!v) return true;
    return v >= dateInput.min && v <= dateInput.max;
  }

  phoneInput.addEventListener("input", function () {
    phoneInput.value = formatPhone(phoneInput.value);
    update();
  });
  [nameInput, serviceSelect].forEach(function (el) {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });
  dateInput.addEventListener("change", function () {
    if (!dataDentroDaJanela()) {
      dateInput.value = "";
      aviso("A agenda está aberta só até " + formatDate(dateInput.max) + ".");
      ocupados = [];
      renderTimes();
      update();
      return;
    }
    carregarOcupados();
  });

  $("add-guest").addEventListener("click", function () {
    guests.push({ name: "", service: "" });
    renderGuests();
    update();
  });

  submit.addEventListener("click", enviar);

  $("booking-form").addEventListener("submit", function (e) {
    e.preventDefault();
  });

  $("wa-float").href = waLink("Olá! Vim pelo site da Flávia Nails 💗");

  update();
})();
