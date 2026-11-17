-- =====================================================================
-- msabridogruyol.com — Supabase kurulumu
-- Supabase panelinde: SQL Editor > New query > bu dosyanın tamamını
-- yapıştırın > Run. Birden fazla kez çalıştırmak güvenlidir.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Yöneticiler
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Ziyaretler (bir satır = bir sayfa oturumu)
-- IP adresi saklanmaz; yalnızca şehir/ülke düzeyinde konum tutulur.
-- ---------------------------------------------------------------------
create table if not exists public.visits (
  id           uuid primary key,
  visitor_id   uuid,                     -- yalnızca rıza verildiyse dolu
  visit_no     int  check (visit_no between 1 and 100000),
  consent      boolean not null default false,
  started_at   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  duration_sec int not null default 0,
  page         text check (char_length(page) <= 200),
  referrer     text check (char_length(referrer) <= 300),
  utm_source   text check (char_length(utm_source) <= 100),
  lang         text check (char_length(lang) <= 20),
  device       text check (char_length(device) <= 20),
  os           text check (char_length(os) <= 40),
  browser      text check (char_length(browser) <= 40),
  screen       text check (char_length(screen) <= 20),
  country      text check (char_length(country) <= 60),
  region       text check (char_length(region) <= 80),
  city         text check (char_length(city) <= 80),
  tz           text check (char_length(tz) <= 60),
  sections     jsonb not null default '{}'::jsonb      -- bölüm adı -> görüntülenme süresi (sn)
);
alter table public.visits add column if not exists sections jsonb not null default '{}'::jsonb;
create index if not exists visits_started_idx on public.visits (started_at desc);
create index if not exists visits_visitor_idx on public.visits (visitor_id);
alter table public.visits enable row level security;

-- Ziyaretçi sunucu zamanını ve süreyi değiştiremesin
create or replace function public.visits_before_insert()
returns trigger language plpgsql as $$
begin
  new.started_at := now();
  new.last_seen := now();
  new.duration_sec := 0;
  new.sections := '{}'::jsonb;
  if not new.consent then
    new.visitor_id := null; new.visit_no := null;
    new.country := null; new.region := null; new.city := null;
    new.referrer := null; new.utm_source := null; new.screen := null;
  end if;
  return new;
end $$;
drop trigger if exists visits_bi on public.visits;
create trigger visits_bi before insert on public.visits
  for each row execute function public.visits_before_insert();

-- ---------------------------------------------------------------------
-- Olaylar (tıklama, bölümde geçirilen süre) — yalnızca rıza ile
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id         bigint generated always as identity primary key,
  visit_id   uuid not null references public.visits (id) on delete cascade,
  ts         timestamptz not null default now(),
  t_offset   int check (t_offset between 0 and 86400),   -- oturum başından itibaren sn
  type       text not null check (type in ('click', 'section')),   -- 'section' eski sürümden kalma
  label      text check (char_length(label) <= 160),
  target     text check (char_length(target) <= 400),
  section    text check (char_length(section) <= 60),
  value      int  check (value between 0 and 86400)
);
create index if not exists events_visit_idx on public.events (visit_id);
create index if not exists events_ts_idx on public.events (ts desc);
alter table public.events enable row level security;

create or replace function public.events_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.ts := now();
  if not exists (select 1 from public.visits v
                 where v.id = new.visit_id and v.consent
                   and v.started_at > now() - interval '1 day') then
    raise exception 'invalid visit';
  end if;
  return new;
end $$;
drop trigger if exists events_bi on public.events;
create trigger events_bi before insert on public.events
  for each row execute function public.events_before_insert();

-- Oturum süresini ve bölüm sürelerini güncelle
-- (ziyaretçi yalnızca kendi oturumunu, 1 gün içinde; süre yalnızca artabilir)
drop function if exists public.touch_visit(uuid, int);
create or replace function public.touch_visit(p_id uuid, p_duration int, p_sections jsonb default null)
returns void
language sql
security definer
set search_path = public
as $$
  update public.visits
     set duration_sec = greatest(duration_sec, least(greatest(p_duration, 0), 21600)),
         sections = case
                      when consent and p_sections is not null
                       and jsonb_typeof(p_sections) = 'object'
                       and length(p_sections::text) <= 2000
                      then p_sections else sections end,
         last_seen = now()
   where id = p_id and started_at > now() - interval '1 day';
$$;

-- ---------------------------------------------------------------------
-- Site içeriği (tek satır JSON)
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  id         smallint primary key default 1 check (id = 1),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
alter table public.site_content enable row level security;

-- ---------------------------------------------------------------------
-- Yetkiler ve politikalar
-- ---------------------------------------------------------------------
revoke all on public.visits, public.events, public.site_content, public.admins from anon, authenticated;

grant insert on public.visits, public.events to anon, authenticated;
grant select, delete on public.visits, public.events to authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.touch_visit(uuid, int, jsonb) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "visits_insert" on public.visits;
create policy "visits_insert" on public.visits for insert to anon, authenticated with check (true);
drop policy if exists "visits_admin_read" on public.visits;
create policy "visits_admin_read" on public.visits for select to authenticated using (public.is_admin());
drop policy if exists "visits_admin_delete" on public.visits;
create policy "visits_admin_delete" on public.visits for delete to authenticated using (public.is_admin());

drop policy if exists "events_insert" on public.events;
create policy "events_insert" on public.events for insert to anon, authenticated with check (true);
drop policy if exists "events_admin_read" on public.events;
create policy "events_admin_read" on public.events for select to authenticated using (public.is_admin());
drop policy if exists "events_admin_delete" on public.events;
create policy "events_admin_delete" on public.events for delete to authenticated using (public.is_admin());

drop policy if exists "content_public_read" on public.site_content;
create policy "content_public_read" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "content_admin_insert" on public.site_content;
create policy "content_admin_insert" on public.site_content for insert to authenticated with check (public.is_admin());
drop policy if exists "content_admin_update" on public.site_content;
create policy "content_admin_update" on public.site_content for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- SON ADIM (kullanıcıyı oluşturduktan sonra):
-- Authentication > Users > Add user ile e-posta ve şifrenizi ekleyin,
-- ardından aşağıdaki satırdaki e-postayı kendi adresinizle değiştirip
-- tek başına çalıştırın:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'SIZIN-EPOSTANIZ@ornek.com'
-- on conflict do nothing;
-- =====================================================================
