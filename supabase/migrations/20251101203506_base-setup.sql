
  create table "public"."base_match" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "started_at" timestamp without time zone,
    "finished_at" timestamp without time zone,
    "discipline" uuid not null,
    "sets" json
      );


alter table "public"."base_match" enable row level security;


  create table "public"."discipline" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" character varying not null,
    "gender" character varying not null,
    "is_doubles" boolean not null,
    "charge" numeric,
    "tournament" uuid
      );


alter table "public"."discipline" enable row level security;


  create table "public"."doubles_match" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "started_at" timestamp without time zone,
    "finished_at" timestamp without time zone,
    "discipline" uuid not null,
    "pair_1" uuid not null,
    "pair_2" uuid not null,
    "winner" uuid,
    "sets" json
      ) inherits ("public"."base_match");



  create table "public"."doubles_pair" (
    "player_1" uuid not null,
    "player_2" uuid not null,
    "discipline" uuid not null,
    "created_at" timestamp without time zone not null default now(),
    "id" uuid not null default gen_random_uuid()
      );


alter table "public"."doubles_pair" enable row level security;


  create table "public"."player" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" character varying not null,
    "gender" character varying not null
      );


alter table "public"."player" enable row level security;


  create table "public"."player_charges" (
    "player" uuid not null,
    "tournament" uuid,
    "created_at" timestamp with time zone not null default now(),
    "already_payed" numeric not null default '0'::numeric
      );


alter table "public"."player_charges" enable row level security;


  create table "public"."singles_match" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "started_at" timestamp without time zone,
    "finished_at" timestamp without time zone,
    "discipline" uuid not null,
    "player_1" uuid not null,
    "player_2" uuid not null,
    "winner" uuid,
    "sets" json
      ) inherits ("public"."base_match");



  create table "public"."tournament" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" character varying not null
      );


alter table "public"."tournament" enable row level security;

CREATE UNIQUE INDEX base_match_pkey ON public.base_match USING btree (id);

CREATE UNIQUE INDEX discipline_pkey ON public.discipline USING btree (id);

CREATE UNIQUE INDEX doubles_match_pkey ON public.doubles_match USING btree (id);

CREATE UNIQUE INDEX doubles_pair_pkey ON public.doubles_pair USING btree (id);

CREATE UNIQUE INDEX player_charges_pkey ON public.player_charges USING btree (player);

CREATE UNIQUE INDEX player_pkey ON public.player USING btree (id);

CREATE UNIQUE INDEX singles_match_pkey ON public.singles_match USING btree (id);

CREATE UNIQUE INDEX tournament_pkey ON public.tournament USING btree (id);

alter table "public"."base_match" add constraint "base_match_pkey" PRIMARY KEY using index "base_match_pkey";

alter table "public"."discipline" add constraint "discipline_pkey" PRIMARY KEY using index "discipline_pkey";

alter table "public"."doubles_match" add constraint "doubles_match_pkey" PRIMARY KEY using index "doubles_match_pkey";

alter table "public"."doubles_pair" add constraint "doubles_pair_pkey" PRIMARY KEY using index "doubles_pair_pkey";

alter table "public"."player" add constraint "player_pkey" PRIMARY KEY using index "player_pkey";

alter table "public"."player_charges" add constraint "player_charges_pkey" PRIMARY KEY using index "player_charges_pkey";

alter table "public"."singles_match" add constraint "singles_match_pkey" PRIMARY KEY using index "singles_match_pkey";

alter table "public"."tournament" add constraint "tournament_pkey" PRIMARY KEY using index "tournament_pkey";

alter table "public"."base_match" add constraint "base_match_discipline_fkey" FOREIGN KEY (discipline) REFERENCES public.discipline(id) ON DELETE CASCADE not valid;

alter table "public"."base_match" validate constraint "base_match_discipline_fkey";

alter table "public"."discipline" add constraint "discipline_tournament_fkey" FOREIGN KEY (tournament) REFERENCES public.tournament(id) ON DELETE CASCADE not valid;

alter table "public"."discipline" validate constraint "discipline_tournament_fkey";

alter table "public"."doubles_match" add constraint "doubles_match_pair_1_fkey" FOREIGN KEY (pair_1) REFERENCES public.doubles_pair(id) not valid;

alter table "public"."doubles_match" validate constraint "doubles_match_pair_1_fkey";

alter table "public"."doubles_match" add constraint "doubles_match_pair_2_fkey" FOREIGN KEY (pair_2) REFERENCES public.doubles_pair(id) not valid;

alter table "public"."doubles_match" validate constraint "doubles_match_pair_2_fkey";

alter table "public"."doubles_match" add constraint "doubles_match_winner_fkey" FOREIGN KEY (winner) REFERENCES public.doubles_pair(id) not valid;

alter table "public"."doubles_match" validate constraint "doubles_match_winner_fkey";

alter table "public"."doubles_pair" add constraint "doubles_pair_discipline_fkey" FOREIGN KEY (discipline) REFERENCES public.discipline(id) not valid;

alter table "public"."doubles_pair" validate constraint "doubles_pair_discipline_fkey";

alter table "public"."doubles_pair" add constraint "doubles_pair_player_1_fkey" FOREIGN KEY (player_1) REFERENCES public.player(id) ON DELETE CASCADE not valid;

alter table "public"."doubles_pair" validate constraint "doubles_pair_player_1_fkey";

alter table "public"."doubles_pair" add constraint "doubles_pair_player_2_fkey" FOREIGN KEY (player_2) REFERENCES public.player(id) ON DELETE CASCADE not valid;

alter table "public"."doubles_pair" validate constraint "doubles_pair_player_2_fkey";

alter table "public"."player_charges" add constraint "player_charges_player_fkey" FOREIGN KEY (player) REFERENCES public.player(id) not valid;

alter table "public"."player_charges" validate constraint "player_charges_player_fkey";

alter table "public"."player_charges" add constraint "player_charges_tournament_fkey" FOREIGN KEY (tournament) REFERENCES public.tournament(id) ON DELETE CASCADE not valid;

alter table "public"."player_charges" validate constraint "player_charges_tournament_fkey";

alter table "public"."singles_match" add constraint "singles_match_player_1_fkey" FOREIGN KEY (player_1) REFERENCES public.player(id) not valid;

alter table "public"."singles_match" validate constraint "singles_match_player_1_fkey";

alter table "public"."singles_match" add constraint "singles_match_player_2_fkey" FOREIGN KEY (player_2) REFERENCES public.player(id) not valid;

alter table "public"."singles_match" validate constraint "singles_match_player_2_fkey";

alter table "public"."singles_match" add constraint "singles_match_winner_fkey" FOREIGN KEY (winner) REFERENCES public.player(id) not valid;

alter table "public"."singles_match" validate constraint "singles_match_winner_fkey";

grant delete on table "public"."base_match" to "anon";

grant insert on table "public"."base_match" to "anon";

grant references on table "public"."base_match" to "anon";

grant select on table "public"."base_match" to "anon";

grant trigger on table "public"."base_match" to "anon";

grant truncate on table "public"."base_match" to "anon";

grant update on table "public"."base_match" to "anon";

grant delete on table "public"."base_match" to "authenticated";

grant insert on table "public"."base_match" to "authenticated";

grant references on table "public"."base_match" to "authenticated";

grant select on table "public"."base_match" to "authenticated";

grant trigger on table "public"."base_match" to "authenticated";

grant truncate on table "public"."base_match" to "authenticated";

grant update on table "public"."base_match" to "authenticated";

grant delete on table "public"."base_match" to "service_role";

grant insert on table "public"."base_match" to "service_role";

grant references on table "public"."base_match" to "service_role";

grant select on table "public"."base_match" to "service_role";

grant trigger on table "public"."base_match" to "service_role";

grant truncate on table "public"."base_match" to "service_role";

grant update on table "public"."base_match" to "service_role";

grant delete on table "public"."discipline" to "anon";

grant insert on table "public"."discipline" to "anon";

grant references on table "public"."discipline" to "anon";

grant select on table "public"."discipline" to "anon";

grant trigger on table "public"."discipline" to "anon";

grant truncate on table "public"."discipline" to "anon";

grant update on table "public"."discipline" to "anon";

grant delete on table "public"."discipline" to "authenticated";

grant insert on table "public"."discipline" to "authenticated";

grant references on table "public"."discipline" to "authenticated";

grant select on table "public"."discipline" to "authenticated";

grant trigger on table "public"."discipline" to "authenticated";

grant truncate on table "public"."discipline" to "authenticated";

grant update on table "public"."discipline" to "authenticated";

grant delete on table "public"."discipline" to "service_role";

grant insert on table "public"."discipline" to "service_role";

grant references on table "public"."discipline" to "service_role";

grant select on table "public"."discipline" to "service_role";

grant trigger on table "public"."discipline" to "service_role";

grant truncate on table "public"."discipline" to "service_role";

grant update on table "public"."discipline" to "service_role";

grant delete on table "public"."doubles_match" to "anon";

grant insert on table "public"."doubles_match" to "anon";

grant references on table "public"."doubles_match" to "anon";

grant select on table "public"."doubles_match" to "anon";

grant trigger on table "public"."doubles_match" to "anon";

grant truncate on table "public"."doubles_match" to "anon";

grant update on table "public"."doubles_match" to "anon";

grant delete on table "public"."doubles_match" to "authenticated";

grant insert on table "public"."doubles_match" to "authenticated";

grant references on table "public"."doubles_match" to "authenticated";

grant select on table "public"."doubles_match" to "authenticated";

grant trigger on table "public"."doubles_match" to "authenticated";

grant truncate on table "public"."doubles_match" to "authenticated";

grant update on table "public"."doubles_match" to "authenticated";

grant delete on table "public"."doubles_match" to "service_role";

grant insert on table "public"."doubles_match" to "service_role";

grant references on table "public"."doubles_match" to "service_role";

grant select on table "public"."doubles_match" to "service_role";

grant trigger on table "public"."doubles_match" to "service_role";

grant truncate on table "public"."doubles_match" to "service_role";

grant update on table "public"."doubles_match" to "service_role";

grant delete on table "public"."doubles_pair" to "anon";

grant insert on table "public"."doubles_pair" to "anon";

grant references on table "public"."doubles_pair" to "anon";

grant select on table "public"."doubles_pair" to "anon";

grant trigger on table "public"."doubles_pair" to "anon";

grant truncate on table "public"."doubles_pair" to "anon";

grant update on table "public"."doubles_pair" to "anon";

grant delete on table "public"."doubles_pair" to "authenticated";

grant insert on table "public"."doubles_pair" to "authenticated";

grant references on table "public"."doubles_pair" to "authenticated";

grant select on table "public"."doubles_pair" to "authenticated";

grant trigger on table "public"."doubles_pair" to "authenticated";

grant truncate on table "public"."doubles_pair" to "authenticated";

grant update on table "public"."doubles_pair" to "authenticated";

grant delete on table "public"."doubles_pair" to "service_role";

grant insert on table "public"."doubles_pair" to "service_role";

grant references on table "public"."doubles_pair" to "service_role";

grant select on table "public"."doubles_pair" to "service_role";

grant trigger on table "public"."doubles_pair" to "service_role";

grant truncate on table "public"."doubles_pair" to "service_role";

grant update on table "public"."doubles_pair" to "service_role";

grant delete on table "public"."player" to "anon";

grant insert on table "public"."player" to "anon";

grant references on table "public"."player" to "anon";

grant select on table "public"."player" to "anon";

grant trigger on table "public"."player" to "anon";

grant truncate on table "public"."player" to "anon";

grant update on table "public"."player" to "anon";

grant delete on table "public"."player" to "authenticated";

grant insert on table "public"."player" to "authenticated";

grant references on table "public"."player" to "authenticated";

grant select on table "public"."player" to "authenticated";

grant trigger on table "public"."player" to "authenticated";

grant truncate on table "public"."player" to "authenticated";

grant update on table "public"."player" to "authenticated";

grant delete on table "public"."player" to "service_role";

grant insert on table "public"."player" to "service_role";

grant references on table "public"."player" to "service_role";

grant select on table "public"."player" to "service_role";

grant trigger on table "public"."player" to "service_role";

grant truncate on table "public"."player" to "service_role";

grant update on table "public"."player" to "service_role";

grant delete on table "public"."player_charges" to "anon";

grant insert on table "public"."player_charges" to "anon";

grant references on table "public"."player_charges" to "anon";

grant select on table "public"."player_charges" to "anon";

grant trigger on table "public"."player_charges" to "anon";

grant truncate on table "public"."player_charges" to "anon";

grant update on table "public"."player_charges" to "anon";

grant delete on table "public"."player_charges" to "authenticated";

grant insert on table "public"."player_charges" to "authenticated";

grant references on table "public"."player_charges" to "authenticated";

grant select on table "public"."player_charges" to "authenticated";

grant trigger on table "public"."player_charges" to "authenticated";

grant truncate on table "public"."player_charges" to "authenticated";

grant update on table "public"."player_charges" to "authenticated";

grant delete on table "public"."player_charges" to "service_role";

grant insert on table "public"."player_charges" to "service_role";

grant references on table "public"."player_charges" to "service_role";

grant select on table "public"."player_charges" to "service_role";

grant trigger on table "public"."player_charges" to "service_role";

grant truncate on table "public"."player_charges" to "service_role";

grant update on table "public"."player_charges" to "service_role";

grant delete on table "public"."singles_match" to "anon";

grant insert on table "public"."singles_match" to "anon";

grant references on table "public"."singles_match" to "anon";

grant select on table "public"."singles_match" to "anon";

grant trigger on table "public"."singles_match" to "anon";

grant truncate on table "public"."singles_match" to "anon";

grant update on table "public"."singles_match" to "anon";

grant delete on table "public"."singles_match" to "authenticated";

grant insert on table "public"."singles_match" to "authenticated";

grant references on table "public"."singles_match" to "authenticated";

grant select on table "public"."singles_match" to "authenticated";

grant trigger on table "public"."singles_match" to "authenticated";

grant truncate on table "public"."singles_match" to "authenticated";

grant update on table "public"."singles_match" to "authenticated";

grant delete on table "public"."singles_match" to "service_role";

grant insert on table "public"."singles_match" to "service_role";

grant references on table "public"."singles_match" to "service_role";

grant select on table "public"."singles_match" to "service_role";

grant trigger on table "public"."singles_match" to "service_role";

grant truncate on table "public"."singles_match" to "service_role";

grant update on table "public"."singles_match" to "service_role";

grant delete on table "public"."tournament" to "anon";

grant insert on table "public"."tournament" to "anon";

grant references on table "public"."tournament" to "anon";

grant select on table "public"."tournament" to "anon";

grant trigger on table "public"."tournament" to "anon";

grant truncate on table "public"."tournament" to "anon";

grant update on table "public"."tournament" to "anon";

grant delete on table "public"."tournament" to "authenticated";

grant insert on table "public"."tournament" to "authenticated";

grant references on table "public"."tournament" to "authenticated";

grant select on table "public"."tournament" to "authenticated";

grant trigger on table "public"."tournament" to "authenticated";

grant truncate on table "public"."tournament" to "authenticated";

grant update on table "public"."tournament" to "authenticated";

grant delete on table "public"."tournament" to "service_role";

grant insert on table "public"."tournament" to "service_role";

grant references on table "public"."tournament" to "service_role";

grant select on table "public"."tournament" to "service_role";

grant trigger on table "public"."tournament" to "service_role";

grant truncate on table "public"."tournament" to "service_role";

grant update on table "public"."tournament" to "service_role";


