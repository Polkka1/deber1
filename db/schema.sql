-- =====================================================================
-- Gestor de Tareas — esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query > Run
-- =====================================================================

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(trim(title)) between 1 and 120),
  description text check (description is null or char_length(description) <= 500),
  priority    text not null default 'media' check (priority in ('baja', 'media', 'alta')),
  due_date    date,
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Mantiene updated_at al día en cada UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Seguridad: RLS activado SIN políticas => nadie con la clave pública
-- puede leer/escribir. Solo el backend (secret key / service_role) accede.
alter table public.tasks enable row level security;

revoke all on public.tasks from anon, authenticated;
grant select, insert, update, delete on public.tasks to service_role;

-- Datos de ejemplo (opcional)
insert into public.tasks (title, description, priority, due_date)
values
  ('Configurar Supabase', 'Crear el proyecto y ejecutar este script', 'alta', current_date),
  ('Desplegar en Vercel', 'Frontend y backend en producción', 'media', current_date + 1);
