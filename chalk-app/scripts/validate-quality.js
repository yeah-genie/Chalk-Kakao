
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 환경 변수 설정
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ CRTICAL ERROR: EXPO_PUBLIC_GEMINI_API_KEY not found in .env file");
    process.exit(1);
}

console.log(`🔑 API Key loaded: ${GEMINI_API_KEY.substring(0, 5)}...`);

async function generateReport(transcript) {
    console.log("Analyzing transcript with Gemini...");

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert educational consultant analyzing a transcript of a tutoring session.
        Analyze the following dialogue and provide structured feedback for the tutor.

        TRANSCRIPT:
        ${transcript}

        Please output valid JSON only, without any markdown formatting or code blocks.
        The JSON should have this structure:
        {
            "summary": "High-level summary of the lesson (2-3 sentences)",
            "concepts": ["Key concept 1", "Key concept 2", ...],
            "strengths": ["Specific strength 1", "Specific strength 2", ...],
            "improvements": ["Specific area for improvement 1", ...],
            "homework": "Specific homework suggestion",
            "nextPlan": "Specific plan for the next session"
        }

        Make the "strengths" and "improvements" extremely specific to the content taught.
        Avoid generic phrases like "Good engagement". Instead use "Explained quadratic formula derivation clearly".
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error generating report:", error);
        return null;
    }
}

async function runTest() {
    try {
        // Load real data
        const dataPath = path.join(__dirname, '../assets/data/lesson_test_samples.json');
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const samples = JSON.parse(fileContent);

        // Test with the first 2 samples
        const testSamples = samples.slice(0, 2);

        console.log(`\n🚀 Starting Quality Test on ${testSamples.length} samples...\n`);

        for (const sample of testSamples) {
            console.log(`\n--------------------------------------------------`);
            console.log(`Checking Sample ID: ${sample.id}`);
            console.log(`Topic: ${sample.topic}`);

            // Extract transcript from conversation array
            const transcript = sample.conversation.map(turn => `${turn.role}: ${turn.text}`).join('\n');

            const start = Date.now();
            const report = await generateReport(transcript);
            const duration = Date.now() - start;

            if (report) {
                console.log(`\n✅ Analysis Complete (${duration}ms)`);
                console.log(`\n📝 SUMMARY:\n${report.summary}`);
                console.log(`\n🌟 STRENGTHS:\n${report.strengths.map(s => `- ${s}`).join('\n')}`);
                console.log(`\n📈 NEEDS REVIEW:\n${report.improvements.map(s => `- ${s}`).join('\n')}`);
                console.log(`\n📚 HOMEWORK: ${report.homework}`);
                console.log(`\n📅 NEXT PLAN: ${report.nextPlan}`);
            } else {
                console.log("\n❌ Analysis Failed");
            }
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTest();
