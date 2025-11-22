import "@supabase/functions-js";
import { createClient } from "@supabase/supabase-js";
import { match } from "name-match";
import { Database } from "databaseTypes";
import { InsertPlayer } from "supabaseTypes";
import { ParsedImportData, PlayerMatchResult } from "import.type";
// @deno-types="@types/lodash"
import { chain, orderBy } from "lodash";
import { getPlayerKey, getFullName } from "import.util";

Deno.serve(async (req: Request): Promise<Response> => {
  return new Response("Test", {
    headers: { "Content-Type": "application/json" },
  });
  const supabaseClient = createClient<Database>(
    // Supabase  URL
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API anon key
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    // Create client with auth context
    {
      global: {
        headers: {
          // 3. Pass the user's Authorization header
          Authorization: req.headers.get("Authorization")!,
        },
      },
    }
  );

  try {
    const importData: ParsedImportData = await req.json();
    const allPlayers = (await supabaseClient.from("player").select("*")).data!;

    const importPlayers: InsertPlayer[] = chain(Object.values(importData))
      .flattenDeep()
      .uniqBy(getPlayerKey)
      .value();

    const playerMatches = new Map<string, PlayerMatchResult>();
    for (const player of importPlayers) {
      const playerKey = getPlayerKey(player);
      const currentPlayerFullName = getFullName(player);

      const playerMatching = allPlayers.map((p) => {
        return {
          player: p,
          score: match(currentPlayerFullName, getFullName(p)) as number,
        };
      });

      const sortedPlayerMatching = orderBy(
        playerMatching,
        (p) => p.score,
        "desc"
      );

      const bestMatch = sortedPlayerMatching[0];
      playerMatches.set(playerKey, {
        isExactMatch: bestMatch.score === 1,
        matchingPlayer: bestMatch.score > 0.75 ? bestMatch.player : null,
        mostSimilarPlayers: sortedPlayerMatching.slice(0, 5),
      });
    }

    return new Response(JSON.stringify(Object.fromEntries(playerMatches)), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/match-players' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
