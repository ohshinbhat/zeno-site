create table if not exists public.projects (
  id text primary key,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id text not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.theme_drafts (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  name text not null,
  config_json jsonb not null,
  form_json jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.theme_versions (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  version text not null,
  hash text not null,
  config_json jsonb not null,
  css text not null,
  status text not null default 'published',
  source_draft_id text references public.theme_drafts(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create table if not exists public.theme_aliases (
  project_id text not null references public.projects(id) on delete cascade,
  environment text not null,
  active_version_id text not null references public.theme_versions(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (project_id, environment)
);

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.theme_drafts enable row level security;
alter table public.theme_versions enable row level security;
alter table public.theme_aliases enable row level security;

create policy "members can read their projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = projects.id
      and project_members.user_id = auth.uid()
    )
  );

create policy "members can read memberships"
  on public.project_members for select
  using (user_id = auth.uid());

create policy "members can read drafts"
  on public.theme_drafts for select
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = theme_drafts.project_id
      and project_members.user_id = auth.uid()
    )
  );

create policy "members can read versions"
  on public.theme_versions for select
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = theme_versions.project_id
      and project_members.user_id = auth.uid()
    )
  );

create policy "members can read aliases"
  on public.theme_aliases for select
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = theme_aliases.project_id
      and project_members.user_id = auth.uid()
    )
  );
