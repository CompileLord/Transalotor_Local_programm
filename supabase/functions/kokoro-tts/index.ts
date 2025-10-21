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

    // Map language codes to Kokoro TTS voices
    const voiceMap: { [key: string]: string } = {
      "en": "af_sarah",
      "ru": "af_sarah", // Kokoro may not have Russian, fallback to English
      "de": "af_sarah",
      "fr": "af_sarah",
      "es": "af_sarah",
      "it": "af_sarah",
      "ja": "af_sarah",
    };

    const selectedVoice = voice !== "default" ? voice : (voiceMap[lang] || "af_sarah");

    // Use Kokoro TTS API
    // Note: In production, this should point to a local Kokoro TTS instance
    const kokoroApiUrl = Deno.env.get("KOKORO_TTS_URL") || "http://localhost:8880/tts";
    
    const response = await fetch(kokoroApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voice: selectedVoice,
        speed: speed,
        lang: lang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kokoro TTS API error: ${response.statusText}`);
    }

    // Get the audio data as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();

    // Return the audio data directly
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