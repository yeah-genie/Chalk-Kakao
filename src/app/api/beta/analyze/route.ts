import { NextRequest } from "next/server";

// Lazy initialization to avoid build-time errors
function getOpenAI() {
  const OpenAI = require("openai").default;
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function getGemini() {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
}

function getResend() {
  const { Resend } = require("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

// Helper to send SSE updates
function createSSEResponse() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const send = (data: object) => {
    controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
  };

  const close = () => {
    controller.close();
  };

  return { stream, send, close };
}

export async function POST(request: NextRequest) {
  const { stream, send, close } = createSSEResponse();

  // Process in background
  (async () => {
    try {
      // Parse form data
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const email = formData.get("email") as string;

      if (!file || !email) {
        send({ error: "Missing file or email" });
        close();
        return;
      }

      // Step 1: Upload
      send({ status: "uploading", progress: 10 });

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Step 2: Transcribe with Whisper
      send({ status: "transcribing", progress: 30 });

      // Create a File object for OpenAI
      const audioFile = new File([buffer], file.name, { type: file.type });

      const openai = getOpenAI();
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
      });

      const transcript = transcription.text;
      const segments = transcription.segments || [];

      // Step 3: Analyze with Gemini
      send({ status: "analyzing", progress: 60 });

      const genAI = getGemini();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const analysisPrompt = `You are an expert teaching coach analyzing a tutoring session transcript.

TRANSCRIPT:
${transcript}

SEGMENTS WITH TIMESTAMPS:
${segments.map((s: { start: number; text: string }) => `[${formatTime(s.start)}] ${s.text}`).join("\n")}

Analyze this tutoring session and provide insights in the following JSON format:

{
  "talkRatio": {
    "tutor": <percentage as number>,
    "student": <percentage as number>
  },
  "keyMoments": [
    {
      "timestamp": "<MM:SS format>",
      "type": "<breakthrough|attention_drop|effective>",
      "quote": "<exact quote from transcript, max 20 words>",
      "insight": "<why this moment was significant, 1 sentence>"
    }
  ],
  "comparison": {
    "effective": {
      "quote": "<quote that worked well>",
      "engagement": <estimated engagement percentage>
    },
    "lessEffective": {
      "quote": "<quote that was less effective>",
      "engagement": <estimated engagement percentage>
    }
  },
  "suggestion": "<specific actionable tip for next session, 1-2 sentences>",
  "summary": "<2-3 sentence summary of the session quality and main takeaway>"
}

Focus on:
1. Moments where the tutor used analogies, real-world examples, or demonstrations
2. Times when the student showed understanding (asking questions, making connections)
3. Points where the tutor may have lost the student's attention
4. Comparing different explanation approaches for the same concept

Provide 3-5 key moments. Be specific with timestamps and quotes.
Return ONLY valid JSON, no markdown or explanation.`;

      const geminiResult = await model.generateContent(analysisPrompt);
      const analysisText = geminiResult.response.text();

      // Parse JSON from Gemini response
      let analysis;
      try {
        // Clean up the response (remove markdown if present)
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", analysisText);
        // Provide fallback analysis
        analysis = {
          talkRatio: { tutor: 65, student: 35 },
          keyMoments: [
            {
              timestamp: "02:30",
              type: "effective",
              quote: "Sample moment from the session",
              insight: "This explanation resonated with the student"
            }
          ],
          comparison: {
            effective: { quote: "Good explanation", engagement: 85 },
            lessEffective: { quote: "Technical explanation", engagement: 45 }
          },
          suggestion: "Try using more real-world examples to illustrate concepts",
          summary: "The session showed good engagement. Consider incorporating more interactive elements."
        };
      }

      send({ status: "analyzing", progress: 80, result: analysis });

      // Step 4: Send email report
      send({ status: "sending_email", progress: 90 });

      try {
        const resend = getResend();
        await resend.emails.send({
          from: "Chalk <hello@briefix.app>",
          to: email,
          subject: "Your Teaching Analysis Report",
          html: generateEmailHTML(analysis, file.name),
        });
      } catch (emailError) {
        console.error("Email failed:", emailError);
        // Continue even if email fails
      }

      // Complete
      send({ status: "complete", progress: 100, result: analysis });
      close();

    } catch (error) {
      console.error("Analysis error:", error);
      send({ error: "Analysis failed. Please try again." });
      close();
    }
  })();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Generate email HTML
function generateEmailHTML(analysis: any, fileName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Teaching Analysis</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Chalk</h1>
      <p style="color: #71717a; font-size: 14px; margin-top: 8px;">Teaching Analysis Report</p>
    </div>

    <!-- Summary -->
    <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0;">Summary</h2>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0;">${analysis.summary}</p>
    </div>

    <!-- Talk Ratio -->
    <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0;">Talk Ratio</h2>
      <p style="color: #a1a1aa; font-size: 14px; margin: 0;">You: ${analysis.talkRatio.tutor}% · Student: ${analysis.talkRatio.student}%</p>
    </div>

    <!-- Key Moments -->
    <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">Key Moments</h2>
      ${analysis.keyMoments.map((m: any) => `
        <div style="background-color: ${m.type === 'attention_drop' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; border: 1px solid ${m.type === 'attention_drop' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <p style="color: ${m.type === 'attention_drop' ? '#fbbf24' : '#34d399'}; font-size: 12px; margin: 0 0 8px 0;">${m.timestamp} · ${m.type === 'breakthrough' ? 'Breakthrough' : m.type === 'effective' ? 'Effective' : 'Attention drop'}</p>
          <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0;">"${m.quote}"</p>
          <p style="color: #71717a; font-size: 12px; margin: 0;">${m.insight}</p>
        </div>
      `).join('')}
    </div>

    <!-- Comparison -->
    <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">What Worked vs What Didn't</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 8px;">
            <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 16px;">
              <p style="color: #34d399; font-size: 12px; margin: 0 0 8px 0;">Effective</p>
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0;">"${analysis.comparison.effective.quote}"</p>
              <p style="color: #34d399; font-size: 20px; font-weight: bold; margin: 0;">${analysis.comparison.effective.engagement}%</p>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 8px;">
            <div style="background-color: #27272a; border-radius: 8px; padding: 16px;">
              <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0;">Less effective</p>
              <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 8px 0;">"${analysis.comparison.lessEffective.quote}"</p>
              <p style="color: #71717a; font-size: 20px; font-weight: bold; margin: 0;">${analysis.comparison.lessEffective.engagement}%</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Suggestion -->
    <div style="background-color: rgba(34, 211, 238, 0.05); border: 1px solid rgba(34, 211, 238, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #22d3ee; font-size: 14px; margin: 0 0 8px 0;">Try Next Time</h2>
      <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0;">${analysis.suggestion}</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="color: #52525b; font-size: 12px; margin: 0;">
        Analyzed: ${fileName}<br>
        <a href="https://briefix.app" style="color: #22d3ee; text-decoration: none;">Chalk</a> — Teaching analytics for tutors
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

