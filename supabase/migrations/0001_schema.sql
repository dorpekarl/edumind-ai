-- Users table mirrors auth.users with role metadata
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text check (role in ('student','teacher','admin')) default 'student',
  created_at timestamp with time zone default now()
);

-- Chat history
create table if not exists public.chat_history (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  role text check (role in ('user','assistant','system')) not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Flashcards
create table if not exists public.flashcards (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default now()
);

-- Analytics
create table if not exists public.analytics (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  study_hours numeric default 0,
  topics_completed integer default 0,
  flashcards_completed integer default 0,
  created_at timestamp with time zone default now()
);

-- Subscriptions
create table if not exists public.subscriptions (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null,
  status text not null,
  renewal_date date,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.chat_history enable row level security;
alter table public.flashcards enable row level security;
alter table public.analytics enable row level security;
alter table public.subscriptions enable row level security;

-- Helper: ensure a user row exists on signup (via trigger recommended separately)

-- Policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Chat: users can insert own" on public.chat_history
  for insert with check (auth.uid() = user_id);
create policy "Chat: users can view own" on public.chat_history
  for select using (auth.uid() = user_id);

create policy "Flashcards: users can insert own" on public.flashcards
  for insert with check (auth.uid() = user_id);
create policy "Flashcards: users can view own" on public.flashcards
  for select using (auth.uid() = user_id);
create policy "Flashcards: users can update own" on public.flashcards
  for update using (auth.uid() = user_id);
create policy "Flashcards: users can delete own" on public.flashcards
  for delete using (auth.uid() = user_id);

create policy "Analytics: users can insert own" on public.analytics
  for insert with check (auth.uid() = user_id);
create policy "Analytics: users can view own" on public.analytics
  for select using (auth.uid() = user_id);

create policy "Subscriptions: users can view own" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "Subscriptions: users can insert own" on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy "Subscriptions: users can update own" on public.subscriptions
  for update using (auth.uid() = user_id);