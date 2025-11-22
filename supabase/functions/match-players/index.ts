import "@supabase/functions-js";
import { createClient } from "@supabase/supabase-js";
import { match } from "name-match";
import { Database } from "databaseTypes";
import { Player } from "supabaseTypes";

Deno.serve(async (req) => {
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
    const allPlayers = (await supabaseClient.from("player").select("*")).data;
    const { name } = await req.json();
    const data = {
      message: `Hello ${name}!`,
    };

    match("John Doe", "Jane Doe");

    return new Response(JSON.stringify(data), {
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
