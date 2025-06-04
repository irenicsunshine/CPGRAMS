import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";


const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default voice ID (Rachel)

if (!ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY environment variable");
}

const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const targetVoiceId = voiceId || VOICE_ID;

    const audioStream = await elevenlabs.textToSpeech.convert(
      targetVoiceId,
      {
        text: text,
        modelId: "eleven_multilingual_v2", // Or your preferred model
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0, // Set to a value between 0 and 1 for style exaggeration (e.g. 0.45 for Rachel)
          useSpeakerBoost: true,
        },
        outputFormat: "mp3_44100_128",
      }
    );

    // Convert the AsyncIterable<Uint8Array> to a ReadableStream
    const nodeReadable = Readable.from(audioStream);
    const webReadableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of nodeReadable) {
          controller.enqueue(new Uint8Array(chunk));
        }
        controller.close();
      },
      cancel() {
        nodeReadable.destroy();
      },
    });

    return new NextResponse(webReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: any) {
    console.error("ElevenLabs API error:", error);
    let errorMessage = "Failed to convert text to speech.";
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    // Check for specific ElevenLabs error structures if available
    // For example, if error.body might contain more info
    if (error.body && typeof error.body.detail === "string") {
      errorMessage = error.body.detail;
    }

    return NextResponse.json(
      { error: "Failed to convert text to speech", details: errorMessage },
      { status: 500 }
    );
  }
}
