import "@supabase/functions-js";
import { createClient } from "@supabase/supabase-js";
import { match } from "name-match";
import { Database } from "databaseTypes";
import { InsertPlayer } from "./util/supabase.types.ts";
import { PlayerMatchResult } from "./util/import.type.ts";
import { getFullName } from "./util/import.util.ts";

// @deno-types="@types/lodash"
import _ from "lodash";

Deno.serve(async (req: Request): Promise<Response> => {
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
    const importPlayers: InsertPlayer[] = await req.json();
    const allPlayers = (await supabaseClient.from("player").select("*")).data!;
    if (allPlayers.length === 0) {
      const returnData: PlayerMatchResult[] = importPlayers.map(() => {
        return {
          isExactMatch: false,
          matchingPlayer: null,
          mostSimilarPlayers: [],
        };
      });
      return new Response(JSON.stringify(returnData), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const playerMatches: PlayerMatchResult[] = [];
    for (const player of importPlayers) {
      const currentPlayerFullName = getFullName(player);

      const playerMatching = allPlayers.map((p) => {
        return {
          player: p,
          score: match(currentPlayerFullName, getFullName(p)) as number,
        };
      });

      const sortedPlayerMatching = _.orderBy(
        playerMatching,
        (p) => p.score,
        "desc"
      );

      const bestMatch = sortedPlayerMatching[0];
      playerMatches.push({
        isExactMatch: bestMatch.score === 1,
        matchingPlayer: bestMatch.score > 0.8 ? bestMatch.player : null,
        mostSimilarPlayers: sortedPlayerMatching
          .filter((p) => p.score > 0.6)
          .slice(0, 5),
      });
    }

    return new Response(JSON.stringify(playerMatches), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
