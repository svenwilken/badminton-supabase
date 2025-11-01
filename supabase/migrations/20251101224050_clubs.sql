alter table "public"."base_match" disable row level security;

alter table "public"."discipline" disable row level security;

alter table "public"."doubles_pair" disable row level security;

alter table "public"."player" add column "club" character varying;

alter table "public"."player" disable row level security;

alter table "public"."player_charges" disable row level security;

alter table "public"."tournament" disable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_distinct_clubs()
 RETURNS TABLE(club text)
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


