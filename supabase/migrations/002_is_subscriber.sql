  -- ─── Flag abonnement (suivi manuel) ────────────────────────────────────────
  -- L'app ne gère pas encore de vrai système de paiement (Stripe/RevenueCat).
  -- Ce flag permet à l'admin de marquer manuellement une utilisatrice comme
  -- abonnée en attendant, depuis l'onglet Abonnements du dashboard.
  alter table public.profiles
    add column if not exists is_subscriber boolean not null default false;

  -- ─── Extension de la protection anti auto-promotion ───────────────────────
  -- Le trigger protect_is_admin() (001_is_admin.sql) ne protégeait que
  -- is_admin. On l'étend pour couvrir is_subscriber : la policy "update own
  -- profile" laisse un utilisateur modifier sa propre ligne sans restriction
  -- de colonnes, donc sans ce garde-fou n'importe qui pourrait se marquer
  -- lui-même comme abonné depuis l'app mobile (clé anon).
  create or replace function public.protect_is_admin()
  returns trigger as $$
  begin
    if (new.is_admin is distinct from old.is_admin
        or new.is_subscriber is distinct from old.is_subscriber)
      and auth.role() <> 'service_role' then
      new.is_admin := old.is_admin;
      new.is_subscriber := old.is_subscriber;
    end if;
    return new;
  end;
  $$ language plpgsql security definer;

  -- Le trigger existant (on_profiles_protect_is_admin) pointe déjà vers cette
  -- fonction — pas besoin de le recréer, seule la fonction change de corps.
