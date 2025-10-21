import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TTSRequest {
  text: string;
  lang: string;
  speed?: number;
  volume?: number;
  voice?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, lang, speed = 1.0, volume = 1.0, voice = "default" }: TTSRequest = await req.json();

    if (!text || !lang) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: text, lang" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const backendUrl = Deno.env.get("BACKEND_URL") || "http://localhost:8000";
    const ttsApiUrl = `${backendUrl}/api/tts`;

    const response = await fetch(ttsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        lang,
        speed,
        volume,
        voice: voice !== "default" ? voice : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kokoro TTS API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "TTS synthesis failed" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});