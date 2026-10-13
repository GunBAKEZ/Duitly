-- Jalankan setelah migrasi Drizzle. Tiap user hanya bisa akses barisnya sendiri.
do $$
declare t text;
begin
  foreach t in array array[
    'accounts','categories','transactions','budgets','debts',
    'debt_payments','savings_goals','savings_contributions','wishlist_items'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('alter table public.%I alter column user_id set default auth.uid()', t);
  end loop;
end $$;
