alter table "public"."doubles_pair" drop constraint "doubles_pair_discipline_fkey";

drop function if exists "public"."get_distinct_clubs"();


  create table "public"."singles_player" (
    "player_id" uuid not null,
    "discipline_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."player" drop column "name";

alter table "public"."player" add column "firstname" character varying;

alter table "public"."player" add column "lastname" character varying not null;

CREATE UNIQUE INDEX singles_player_pkey ON public.singles_player USING btree (player_id, discipline_id);

alter table "public"."singles_player" add constraint "singles_player_pkey" PRIMARY KEY using index "singles_player_pkey";

alter table "public"."singles_player" add constraint "singles_player_discipline_id_fkey" FOREIGN KEY (discipline_id) REFERENCES public.discipline(id) ON DELETE CASCADE not valid;

alter table "public"."singles_player" validate constraint "singles_player_discipline_id_fkey";

alter table "public"."singles_player" add constraint "singles_player_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public.player(id) ON DELETE CASCADE not valid;

alter table "public"."singles_player" validate constraint "singles_player_player_id_fkey";

alter table "public"."doubles_pair" add constraint "doubles_pair_discipline_fkey" FOREIGN KEY (discipline) REFERENCES public.discipline(id) ON DELETE CASCADE not valid;

alter table "public"."doubles_pair" validate constraint "doubles_pair_discipline_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_distinct_clubs()
 RETURNS TABLE(club character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT player.club
  FROM player
  WHERE player.club IS NOT NULL
  ORDER BY player.club ASC;
END;
$function$
;

grant delete on table "public"."singles_player" to "anon";

grant insert on table "public"."singles_player" to "anon";

grant references on table "public"."singles_player" to "anon";

grant select on table "public"."singles_player" to "anon";

grant trigger on table "public"."singles_player" to "anon";

grant truncate on table "public"."singles_player" to "anon";

grant update on table "public"."singles_player" to "anon";

grant delete on table "public"."singles_player" to "authenticated";

grant insert on table "public"."singles_player" to "authenticated";

grant references on table "public"."singles_player" to "authenticated";

grant select on table "public"."singles_player" to "authenticated";

grant trigger on table "public"."singles_player" to "authenticated";

grant truncate on table "public"."singles_player" to "authenticated";

grant update on table "public"."singles_player" to "authenticated";

grant delete on table "public"."singles_player" to "service_role";

grant insert on table "public"."singles_player" to "service_role";

grant references on table "public"."singles_player" to "service_role";

grant select on table "public"."singles_player" to "service_role";

grant trigger on table "public"."singles_player" to "service_role";

grant truncate on table "public"."singles_player" to "service_role";

grant update on table "public"."singles_player" to "service_role";


