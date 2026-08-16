-- ─── Flag admin sur profiles ──────────────────────────────────────────────────
-- Utilisé par requireAdmin() (arira-dashboard) pour autoriser l'accès au
-- dashboard. Ne donne AUCUN accès élargi via le RLS : le dashboard lit les
-- données de tous les utilisateurs via la clé service_role côté serveur,
-- après avoir vérifié ce flag — pas via une policy RLS "admin voit tout".
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ─── Protection anti auto-promotion ───────────────────────────────────────────
-- La policy "update own profile" (002_profiles.sql) autorise un utilisateur
-- à modifier son propre profil sans restriction de colonnes. Sans ce trigger,
-- n'importe qui pourrait passer is_admin à true sur sa propre ligne depuis
-- l'app mobile (clé anon). Seule la clé service_role (utilisée uniquement
-- côté serveur dans arira-dashboard) peut changer ce flag.
create or replace function public.protect_is_admin()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profiles_protect_is_admin on public.profiles;
create trigger on_profiles_protect_is_admin
  before update on public.profiles
  for each row execute function public.protect_is_admin();

-- ─── Activation manuelle du premier admin ─────────────────────────────────────
-- À exécuter une fois, directement dans le SQL editor Supabase (avec les
-- droits owner, donc hors RLS) — remplacer l'email par le tien :
--
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'ton-email@exemple.com');
