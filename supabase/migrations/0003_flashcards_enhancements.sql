-- Flashcard collections
create table if not exists public.flashcard_collections (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

alter table public.flashcards add column if not exists collection_id bigint references public.flashcard_collections(id) on delete set null;
alter table public.flashcards add column if not exists ef numeric default 2.5; -- easiness factor
alter table public.flashcards add column if not exists interval_days integer default 0;
alter table public.flashcards add column if not exists repetitions integer default 0;
alter table public.flashcards add column if not exists due_date date;

alter table public.flashcard_collections enable row level security;

create policy "Collections: users can manage own" on public.flashcard_collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow selecting flashcards by collection while keeping per-user isolation
create policy "Flashcards: select own by collection" on public.flashcards
  for select using (auth.uid() = user_id);