-- Questionnaire CiprelRH (oui/non) : questions, participants et réponses.
-- À exécuter une fois dans l'éditeur SQL du projet Supabase.
--
-- Principes :
-- - RLS partout, aucune écriture directe : l'enregistrement passe par ciprel_submit,
--   qui valide les réponses et recalcule les scores côté base.
-- - Les participants et leurs réponses (données personnelles) ne sont jamais
--   lisibles par l'API publique : consultation via le tableau de bord Supabase.

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.ciprel_questions (
  id         smallint primary key,
  position   smallint not null unique,
  texte      text not null,
  image      text not null,
  categorie  text not null check (categorie in
    ('forceCollective', 'equite', 'engagement', 'respect', 'innovation', 'convivialite')),
  actif      boolean not null default true
);

create table if not exists public.ciprel_participants (
  id           uuid primary key default gen_random_uuid(),
  nom          text not null check (char_length(nom) between 1 and 80),
  prenom       text not null check (char_length(prenom) between 1 and 80),
  email        text not null check (char_length(email) between 3 and 160 and email like '%@%'),
  contact      text not null check (char_length(contact) between 4 and 40),
  scores       jsonb not null,
  departement  text not null check (char_length(departement) between 1 and 60),
  created_at   timestamptz not null default now()
);

create table if not exists public.ciprel_answers (
  participant_id  uuid not null references public.ciprel_participants (id) on delete cascade,
  question_id     smallint not null references public.ciprel_questions (id) on delete cascade,
  reponse         boolean not null,
  primary key (participant_id, question_id)
);

-- ─── Droits et RLS ───────────────────────────────────────────────────────────

alter table public.ciprel_questions    enable row level security;
alter table public.ciprel_participants enable row level security;
alter table public.ciprel_answers      enable row level security;

revoke all on public.ciprel_questions, public.ciprel_participants, public.ciprel_answers
  from anon, authenticated;

-- Questions actives : lecture publique.
grant select on public.ciprel_questions to anon, authenticated;
drop policy if exists "questions actives lisibles par tous" on public.ciprel_questions;
create policy "questions actives lisibles par tous" on public.ciprel_questions
  for select to anon, authenticated using (actif);

-- ─── Enregistrement d'un questionnaire ───────────────────────────────────────

-- p_reponses : objet { "<id question>": true | false } couvrant toutes les questions actives.
-- Renvoie l'id du participant.
create or replace function public.ciprel_submit(
  p_nom text, p_prenom text, p_email text, p_contact text,
  p_reponses jsonb, p_departement text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id      uuid;
  v_actives integer;
  v_scores  jsonb;
begin
  if jsonb_typeof(p_reponses) <> 'object' then
    raise exception 'reponses invalides';
  end if;

  select count(*) into v_actives from public.ciprel_questions where actif;

  -- Une réponse booléenne par question active, ni plus ni moins.
  if (select count(*) from jsonb_each(p_reponses)) <> v_actives
     or exists (
       select 1 from jsonb_each(p_reponses) r
       left join public.ciprel_questions q on q.actif and q.id::text = r.key
       where q.id is null or jsonb_typeof(r.value) <> 'boolean'
     ) then
    raise exception 'reponses incompletes ou invalides';
  end if;

  -- Scores par soft skill : nombre de « oui » et nombre de questions.
  select jsonb_object_agg(categorie, jsonb_build_object('points', points, 'max', total))
    into v_scores
  from (
    select q.categorie,
           count(*) filter (where (p_reponses ->> q.id::text)::boolean) as points,
           count(*) as total
    from public.ciprel_questions q
    where q.actif
    group by q.categorie
  ) s;

  insert into public.ciprel_participants (nom, prenom, email, contact, scores, departement)
  values (trim(p_nom), trim(p_prenom), lower(trim(p_email)), trim(p_contact), v_scores, trim(p_departement))
  returning id into v_id;

  insert into public.ciprel_answers (participant_id, question_id, reponse)
  select v_id, key::smallint, value::boolean from jsonb_each_text(p_reponses);

  return v_id;
end;
$$;

revoke all on function public.ciprel_submit(text, text, text, text, jsonb, text) from public;
grant execute on function public.ciprel_submit(text, text, text, text, jsonb, text) to anon, authenticated;

-- ─── Questions ───────────────────────────────────────────────────────────────
-- « Oui » signifie que la soft skill est présente (1 point), « Non » 0 point.

insert into public.ciprel_questions (id, position, texte, image, categorie) values
  (1,  1,  'Face à un défi complexe, préférez-vous chercher la solution avec d''autres ?', '/images/questions/1a.webp', 'forceCollective'),
  (2,  2,  'En cas de conflit, cherchez-vous une solution juste pour toutes les parties, même si elle prend plus de temps ?', '/images/questions/2a.webp', 'equite'),
  (3,  3,  'Un objectif ambitieux vous donne-t-il envie de vous dépasser ?', '/images/questions/3a.webp', 'engagement'),
  (4,  4,  'Quand une nouvelle procédure est mise en place, la suivez-vous scrupuleusement ?', '/images/questions/4a.webp', 'respect'),
  (5,  5,  'Pour résoudre un problème, aimez-vous essayer de nouvelles approches ?', '/images/questions/5a.webp', 'innovation'),
  (6,  6,  'En réunion, partagez-vous volontiers vos idées ?', '/images/questions/6a.webp', 'convivialite'),
  (7,  7,  'Êtes-vous plus motivé·e par un objectif commun que par une contribution individuelle ?', '/images/questions/7a.webp', 'forceCollective'),
  (8,  8,  'Pour attribuer des ressources, privilégiez-vous un partage équitable entre tous ?', '/images/questions/8a.webp', 'equite'),
  (9,  9,  'Après une réussite, avez-vous envie de relever un défi encore plus grand ?', '/images/questions/9a.webp', 'engagement'),
  (10, 10, 'Face à une nouvelle technologie, aimez-vous en explorer toutes les fonctionnalités ?', '/images/questions/10a.webp', 'innovation'),
  (11, 11, 'Quand votre idée est rejetée, cherchez-vous un compromis avec les autres ?', '/images/questions/11b.webp', 'convivialite'),
  (12, 12, 'Préférez-vous présenter un travail en équipe plutôt que seul·e ?', '/images/questions/12a.webp', 'forceCollective'),
  (13, 13, 'Dans une équipe, veillez-vous à ce que chacun ait les mêmes opportunités ?', '/images/questions/13a.webp', 'equite'),
  (14, 14, 'Quand vous commencez un projet, le menez-vous à bien malgré les obstacles ?', '/images/questions/14a.webp', 'engagement'),
  (15, 15, 'Respectez-vous une règle même quand elle semble ralentir le travail ?', '/images/questions/15a.webp', 'respect'),
  (16, 16, 'Dans un projet créatif, osez-vous des idées originales, même risquées ?', '/images/questions/16a.webp', 'innovation'),
  (17, 17, 'Pendant une pause, aimez-vous discuter avec vos collègues ?', '/images/questions/17a.webp', 'convivialite'),
  (18, 18, 'En situation d''urgence, misez-vous d''abord sur la coordination avec l''équipe ?', '/images/questions/18a.webp', 'forceCollective')
on conflict (id) do update set
  position = excluded.position, texte = excluded.texte, image = excluded.image,
  categorie = excluded.categorie, actif = excluded.actif;
