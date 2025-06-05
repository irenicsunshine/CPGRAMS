"use server";
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from "ai";


const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GOOGLE_VERTEX_PROJECT_ID = process.env.GOOGLE_VERTEX_PROJECT_ID;
const GOOGLE_VERTEX_LOCATION = process.env.GOOGLE_VERTEX_LOCATION;

const vertex = createVertex({
  project: GOOGLE_VERTEX_PROJECT_ID,
  location: GOOGLE_VERTEX_LOCATION,
  googleAuthOptions: {
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  },
});

const SYSTEM_PROMPT = `
You are a Gemini assistant designed to summarize citizen grievances submitted via YouTube video links. Your role is to analyze both audio and visual content to understand and summarize citizen concerns.

## Your Task
When a citizen submits a YouTube video link containing a grievance:

1. **Process the video content** by analyzing both:
   - Audio elements (spoken complaints, tone, urgency)
   - Visual elements (documentation shown, physical conditions, gestures, written signs)

2. **Extract key information**:
   - Nature of the grievance/complaint
   - Specific issues mentioned
   - Location or department involved (if mentioned)
   - Supporting evidence shown in video

3. **Provide a structured summary** including:
   - **Grievance Type**: Category of complaint
   - **Main Issue**: Clear description of the primary concern
   - **Details**: Key points and evidence presented
   - **Citizen Information**: Any contact details or identification provided

## Guidelines
- Remain objective and factual in your analysis
- Note any emotional distress or urgency indicators
- Identify any supporting documents or evidence shown
- If video quality is poor or content unclear, note these limitations
- Do NOT attempt to provide solutions or action items
`;

// Process a video query
export async function processVideoQuery(query: string, url: string): Promise<string> {
    // Regular expressions to find YouTube video IDs from different URL formats
    const youtubeRegexes = [
        /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, // Standard watch URL
        /https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,             // Shortened youtu.be URL
        /https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,    // Embed URL
        /https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,        // v/ URL
        /https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/    // Shorts URL
    ];

    let videoId = null;
    for (const regex of youtubeRegexes) {
        const match = url.match(regex);
        if (match && match[1]) {
            videoId = match[1];
            break; // Found a video ID, stop searching
        }
    }

    if (!videoId) {
        console.error("No YouTube URL found in the query:", query);
        return "Error: No valid YouTube URL found in the query provided.";
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("Processing YouTube video:", videoUrl);

    if (!GOOGLE_APPLICATION_CREDENTIALS || !GOOGLE_VERTEX_PROJECT_ID || !GOOGLE_VERTEX_LOCATION) {
        let missingVars = [];
        if (!GOOGLE_APPLICATION_CREDENTIALS) missingVars.push("GOOGLE_APPLICATION_CREDENTIALS");
        if (!GOOGLE_VERTEX_PROJECT_ID) missingVars.push("GOOGLE_VERTEX_PROJECT_ID");
        if (!GOOGLE_VERTEX_LOCATION) missingVars.push("GOOGLE_VERTEX_LOCATION");
        console.error(`Missing environment variables: ${missingVars.join(', ')}. Vertex AI calls will fail.`);
        return `Error: Server configuration error (missing: ${missingVars.join(', ')}).`;
    }

    try {
        const { text: summary } = await generateText({
            model: vertex('gemini-2.0-flash-001'),
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Please summarize the following YouTube video. The user\'s original query related to this video was: "${query}"',
                        },
                        {
                            type: 'file',
                            data: videoUrl,
                            mimeType: 'video/mp4',
                        },
                    ] as any,
                },
            ],
        });

        if (!summary) {
            console.error("Gemini returned an empty summary for video:", videoUrl);
            return "Error: Received no summary from the AI for the provided video.";
        }

        return summary;

    } catch (error) {
        console.error("Error processing video with Gemini:", error);
        if (error instanceof Error) {
            return `Error: Failed to process video. ${error.message}`;
        }
        return "Error: An unknown error occurred while processing the video.";
    }
}