-- ============================================================
--  Flávia Nails — banco da agenda (Supabase / PostgreSQL)
-- ============================================================
--  Como usar: no painel do Supabase, abra "SQL Editor", cole
--  este arquivo inteiro e clique em RUN. Roda uma vez só.
-- ============================================================

create table if not exists public.agendamentos (
  id             bigint generated always as identity primary key,
  data           date        not null,
  horario        text        not null,
  -- 'agendamento' = pedido feito por uma cliente pelo site
  -- 'bloqueio'    = horário fechado pela Flávia no painel
  tipo           text        not null default 'agendamento',
  -- 'pendente' = cliente pediu, ainda não foi confirmado no WhatsApp
  -- 'confirmado' = a Flávia confirmou
  status         text        not null default 'pendente',
  nome           text        not null,
  telefone       text        not null default '',
  servico        text        not null default '',
  acompanhantes  jsonb       not null default '[]'::jsonb,
  observacao     text        not null default '',
  criado_em      timestamptz not null default now(),

  constraint agendamentos_tipo_valido check (tipo in ('agendamento', 'bloqueio')),
  constraint agendamentos_status_valido check (status in ('pendente', 'confirmado')),

  -- Garante no próprio banco que dois agendamentos nunca ocupam o mesmo
  -- horário: se duas clientes clicarem ao mesmo tempo, a segunda recebe
  -- erro e o site avisa na hora que o horário acabou de sair.
  constraint agendamentos_horario_unico unique (data, horario)
);

create index if not exists agendamentos_data_idx on public.agendamentos (data);

-- ------------------------------------------------------------
--  Segurança (Row Level Security)
-- ------------------------------------------------------------
--  Sem nenhuma política, ninguém lê nem escreve nada.

alter table public.agendamentos enable row level security;

-- A CLIENTE (chave anônima, que fica pública no site) pode apenas
-- CRIAR um agendamento — e só em data de hoje em diante.
drop policy if exists "cliente cria agendamento" on public.agendamentos;
create policy "cliente cria agendamento"
  on public.agendamentos
  for insert
  to anon
  with check (
    tipo = 'agendamento'
    and status = 'pendente'
    and data >= current_date
    and length(nome) between 2 and 120
    and length(telefone) between 8 and 40
  );

-- A cliente NÃO pode ler a tabela: nome e telefone das outras clientes
-- ficam invisíveis para o site público. (Sem política de select = negado.)

-- A FLÁVIA (logada com e-mail e senha no painel) enxerga e controla tudo.
drop policy if exists "admin le tudo" on public.agendamentos;
create policy "admin le tudo"
  on public.agendamentos for select to authenticated using (true);

drop policy if exists "admin cria" on public.agendamentos;
create policy "admin cria"
  on public.agendamentos for insert to authenticated with check (true);

drop policy if exists "admin edita" on public.agendamentos;
create policy "admin edita"
  on public.agendamentos for update to authenticated using (true) with check (true);

drop policy if exists "admin apaga" on public.agendamentos;
create policy "admin apaga"
  on public.agendamentos for delete to authenticated using (true);

-- ------------------------------------------------------------
--  O que o site público pode perguntar
-- ------------------------------------------------------------
--  Só isto: "quais horários já estão ocupados neste dia?".
--  Nenhum dado pessoal sai por aqui.

create or replace function public.horarios_ocupados(dia date)
returns table (horario text)
language sql
stable
security definer
set search_path = public
as $$
  select a.horario
  from public.agendamentos a
  where a.data = dia
$$;

revoke all on function public.horarios_ocupados(date) from public;
grant execute on function public.horarios_ocupados(date) to anon, authenticated;
