/* Flávia Nails — lógica do agendamento (JS puro, sem build) */
(function () {
  "use strict";

  var CONFIG = window.CONFIG;
  var guests = [];
  var selectedTime = "";

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
        selectedTime,
    );
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
    guests.forEach(function (g, i) {
      if (!g.name && !g.service) return;
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

  /* ---------- render ---------- */

  function renderTimes() {
    timesBox.innerHTML = "";
    CONFIG.times.forEach(function (t) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "time" + (t === selectedTime ? " is-active" : "");
      btn.textContent = t;
      btn.setAttribute("aria-pressed", t === selectedTime ? "true" : "false");
      btn.addEventListener("click", function () {
        selectedTime = t;
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
    submit.setAttribute("aria-disabled", ready ? "false" : "true");
    submit.classList.toggle("is-disabled", !ready);
    submit.href = ready ? waLink(buildMessage()) : "#";
    hint.style.visibility = ready ? "hidden" : "visible";
  }

  /* ---------- init ---------- */

  serviceOptions(serviceSelect, "");
  renderTimes();
  renderPrices();

  // Não deixa escolher uma data que já passou.
  var today = new Date();
  var pad = function (n) {
    return String(n).padStart(2, "0");
  };
  dateInput.min =
    today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());

  phoneInput.addEventListener("input", function () {
    phoneInput.value = formatPhone(phoneInput.value);
    update();
  });
  [nameInput, serviceSelect, dateInput].forEach(function (el) {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  $("add-guest").addEventListener("click", function () {
    guests.push({ name: "", service: "" });
    renderGuests();
    update();
  });

  submit.addEventListener("click", function (e) {
    if (!isReady()) {
      e.preventDefault();
      hint.classList.remove("shake");
      // reinicia a animação
      void hint.offsetWidth;
      hint.classList.add("shake");
    }
  });

  $("booking-form").addEventListener("submit", function (e) {
    e.preventDefault();
  });

  $("wa-float").href = waLink("Olá! Vim pelo site da Flávia Nails 💗");

  update();
})();
