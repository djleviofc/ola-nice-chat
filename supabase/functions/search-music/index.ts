import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

    // Search iTunes for track metadata
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&media=music&entity=song&limit=15&country=BR`;
    console.log("Searching iTunes:", itunesUrl);

    const itunesRes = await fetch(itunesUrl, { headers: { "Accept": "application/json" } });

    if (!itunesRes.ok) {
      const text = await itunesRes.text();
      console.error("iTunes error:", itunesRes.status, text);
      return new Response(JSON.stringify({ error: "iTunes API error", status: itunesRes.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const itunesData = await itunesRes.json();
    console.log("iTunes resultCount:", itunesData?.resultCount);

    const tracks = (itunesData?.results || []).filter((t: Record<string, unknown>) => t.previewUrl);

    // For each track, search YouTube to get full video ID
    const results = await Promise.all(
      tracks.map(async (track: Record<string, unknown>) => {
        let youtubeVideoId: string | null = null;

        if (YOUTUBE_API_KEY) {
          try {
            const searchTerm = `${track.trackName} ${track.artistName} official audio`;
            const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
            const ytRes = await fetch(ytUrl);
            if (ytRes.ok) {
              const ytData = await ytRes.json();
              youtubeVideoId = ytData?.items?.[0]?.id?.videoId || null;
              console.log(`YouTube for "${track.trackName}": ${youtubeVideoId}`);
            } else {
              console.error("YouTube search error:", ytRes.status, await ytRes.text());
            }
          } catch (e) {
            console.error("YouTube fetch error:", e);
          }
        }

        return {
          ...track,
          youtubeVideoId,
        };
      })
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("search-music error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
