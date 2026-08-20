import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import logo from "@/assets/flavia-nails-logo.jpg.asset.json";
import heroBg from "@/assets/hero-nails.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flávia Nails — Agendamento Online" },
      {
        name: "description",
        content:
          "Agende seu horário na Flávia Nails: manicure, pedicure, alongamento e esmaltação em gel. Cuidado, beleza e carinho em cada detalhe.",
      },
      { property: "og:title", content: "Flávia Nails — Agendamento Online" },
      {
        property: "og:description",
        content:
          "Agende seu horário na Flávia Nails: manicure, pedicure, alongamento e esmaltação em gel.",
      },
    ],
  }),
  component: Index,
});

const WHATSAPP = "5511910305226";
const INSTAGRAM = "https://www.instagram.com/";

const SERVICES = [
  { name: "Mão", price: "R$ 25,00" },
  { name: "Pé", price: "R$ 30,00" },
  { name: "Mão e pé", price: "R$ 50,00" },
  { name: "Plástica dos pés", price: "R$ 35,00" },
  { name: "Plástica dos pés + esmaltação", price: "R$ 50,00" },
  { name: "Mão + pé + plástica dos pés", price: "R$ 75,00" },
];

const TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

type Guest = { name: string; service: string };

function Index() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);

  const ready = name && phone && service && date && time;

  const message = useMemo(() => {
    const lines = [
      "Olá! Quero confirmar meu agendamento na Flávia Nails 💗",
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Serviço: ${service}`,
      `Data: ${date}`,
      `Horário: ${time}`,
    ];
    guests.forEach((g, i) => {
      lines.push(`Acompanhante ${i + 1}: ${g.name} — ${g.service}`);
    });
    return encodeURIComponent(lines.join("\n"));
  }, [name, phone, service, date, time, guests]);

  return (
    <main>
      {/* Hero + formulário */}
      <section className="relative isolate min-h-screen px-4 py-14">
        <img
          src={heroBg}
          alt=""
          width={1920}
          height={1280}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-background/70" />

        <div className="mx-auto max-w-xl text-center">
          <img
            src={logo.url}
            alt="Logotipo Flávia Nails"
            width={220}
            height={220}
            className="mx-auto w-40 rounded-full shadow-[0_20px_50px_-20px_oklch(0.52_0.13_8/0.45)] sm:w-52"
          />
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-primary sm:text-6xl">
            Flávia Nails
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.35em] text-secondary-foreground">
            Cuidado, beleza e carinho
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Agende seu horário em poucos toques — confirmação pelo WhatsApp.
          </p>
        </div>

        <div className="card-soft mx-auto mt-10 max-w-xl rounded-3xl p-6 sm:p-8">
          <h2 className="border-l-2 border-primary pl-3 text-2xl font-semibold text-primary">
            Seu Agendamento
          </h2>

          <div className="mt-6 space-y-5">
            <Field label="Nome">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="input-base"
              />
            </Field>

            <Field label="WhatsApp">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="DDD + TELEFONE"
                className="input-base"
              />
            </Field>

            <Field label="Serviço">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="input-base"
              >
                <option value="">Selecione um serviço</option>
                {SERVICES.map((s) => (
                  <option key={s.name} value={`${s.name} — ${s.price}`}>
                    {s.name} — {s.price}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Data">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-base"
              />
            </Field>

            <Field label="Selecione o horário">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                      time === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            {guests.map((g, i) => (
              <div
                key={i}
                className="space-y-4 rounded-2xl border border-border bg-secondary/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-foreground">
                    Acompanhante {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setGuests(guests.filter((_, idx) => idx !== i))
                    }
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
                  >
                    remover
                  </button>
                </div>
                <input
                  value={g.name}
                  placeholder="Nome do acompanhante"
                  onChange={(e) =>
                    setGuests(
                      guests.map((item, idx) =>
                        idx === i ? { ...item, name: e.target.value } : item,
                      ),
                    )
                  }
                  className="input-base"
                />
                <select
                  value={g.service}
                  onChange={(e) =>
                    setGuests(
                      guests.map((item, idx) =>
                        idx === i ? { ...item, service: e.target.value } : item,
                      ),
                    )
                  }
                  className="input-base"
                >
                  <option value="">Selecione um serviço</option>
                  {SERVICES.map((s) => (
                    <option key={s.name} value={`${s.name} — ${s.price}`}>
                      {s.name} — {s.price}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setGuests([...guests, { name: "", service: "" }])}
              className="w-full rounded-xl border border-dashed border-primary/50 px-4 py-3 text-sm text-primary transition-colors hover:bg-accent"
            >
              + Adicionar acompanhante (amiga/filha)
            </button>

            <a
              href={`https://wa.me/${WHATSAPP}?text=${message}`}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!ready}
              onClick={(e) => {
                if (!ready) e.preventDefault();
              }}
              className={`block rounded-xl px-4 py-4 text-center text-sm font-medium uppercase tracking-[0.2em] transition-opacity ${
                ready
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              }`}
            >
              Confirmar agendamento
            </a>
          </div>
        </div>
      </section>

      {/* Tabela de preços */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-3xl font-semibold text-primary">
            Tabela de Preços
          </h2>
          <ul className="card-soft mt-8 divide-y divide-border rounded-3xl px-6">
            {SERVICES.map((s) => (
              <li
                key={s.name}
                className="flex items-baseline justify-between gap-4 py-4"
              >
                <span className="text-sm">{s.name}</span>
                <span className="text-sm font-medium text-primary">
                  {s.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Instagram */}
      <section className="px-4 pb-16">
        <div className="card-soft mx-auto max-w-xl rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-semibold text-primary">Siga a Gente</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            @flavianails — trabalhos, novidades e inspirações
          </p>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-xl border border-primary px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary transition-colors hover:bg-accent"
          >
            Seguir no Instagram
          </a>
        </div>
      </section>

      {/* Localização */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold text-primary">
            Nossa Localização
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Atendimento com hora marcada — envie o endereço na confirmação.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Falar no WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Flávia Nails · Cuidado, beleza e carinho em cada detalhe
      </footer>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-secondary-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
