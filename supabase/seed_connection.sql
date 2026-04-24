-- Beispiel: Eine aktive Supabase-Verbindung speichern
-- Werte ggf. anpassen und dann im Supabase SQL Editor ausführen.

insert into public.supabase_connections (
  name,
  supabase_url,
  supabase_anon_key,
  is_active
)
values (
  'wallet-pass-studio-main',
  'https://fcnnrtkvmkpbnsbhfwee.supabase.co',
  'sb_publishable_ai6tT-97fCKJpCWyrHWFXw_IZ2vPDyz',
  true
)
on conflict (name)
do update set
  supabase_url = excluded.supabase_url,
  supabase_anon_key = excluded.supabase_anon_key,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

-- Optional: Nur eine Verbindung aktiv halten.
update public.supabase_connections
set is_active = (name = 'wallet-pass-studio-main')
where owner_id = auth.uid();
